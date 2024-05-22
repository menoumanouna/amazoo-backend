import HTTPStatus from "http-status";
// models
import db from "../../models";

// helpers
import {
  addDocument,
  Error,
  formatJSONResponse,
  hasRole,
  Success,
} from "../../utils/helpres";
import { filteredBody } from "../../utils/filteredBody";
import APIError from "../../services/error";

import { Joi } from "celebrate";
import { Sequelize } from "sequelize-typescript";
import { getCountService, getServices } from "../../models/service";
import { parse } from "../../services/parser";
const { Op } = Sequelize;

const requestWhiteList = {
  create: Object.keys({
    nom: Joi.string().max(200).required(),
    description: Joi.string().max(1000).required(),
    horaire: Joi.string().required(),
  }),
  update: Object.keys({
    nom: Joi.string().max(200).required(),
    description: Joi.string().max(1000).required(),
    horaire: Joi.string().required(),
  }),
};

export const validation = {
  create: {
    body: Joi.object({
      nom: Joi.string().max(200).required(),
      description: Joi.string().max(1000).required(),
      horaire: Joi.string().required(),
    }),
  },
  update: {
    body: Joi.object({
      nom: Joi.string().max(200).allow(),
      description: Joi.string().max(1000).allow(),
      horaire: Joi.string().allow(),
    }),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};
/**
 * Get List Of Contract
 * */
export async function getListService(req, res, next) {
  try {
    const { user } = req;
    // if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
    //   throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    // }
    const { limit, current_page, search, employe_id } = req.query;
    let page = current_page || 1;
    let per_page = limit || 10;
    if (page < 1) page = 1;
    let offset = (page - 1) * per_page;
    const defaultValue = {
      order: [["id", "DESC"]],
      subQuery: false,
    };
    req.query.offset = offset;
    const parsedValue = parse(req.query, db.service.rawAttributes);
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let services;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountService(values, transaction, search, employe_id);
      services = await getServices(values, transaction, search, employe_id);
      count = services.length;
    });
    if (services.length === 0) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Liste vide");
    }
    let pagination = {};
    pagination.total = countAll.length;
    pagination.per_page = parseInt(per_page);
    pagination.offset = offset;
    pagination.to = offset + count;
    pagination.last_page = Math.ceil(countAll / per_page);
    pagination.current_page = parseInt(page);
    pagination.from = offset;
    pagination.data = services;
    return res.status(HTTPStatus.OK).json(pagination);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Create Service
 * */
export async function create(req, res, next) {
  try {
    const { user, files } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const body = filteredBody(req.body, requestWhiteList.create);
    const existService = await db.service.count({
      where: { nom: body.nom, employe_id: user.id },
    });

    if (existService > 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Service déja existe");
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      body.employe_id = user.id;
      result = await db.service.create(
        {
          ...body,
        },
        { transaction },
      );
      if (!result) {
        throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Service non créer");
      }
      if (files && files.length > 0) {
        for await (const file of files) {
          await addDocument(file, result.id, "service");

          await db.image.create(
            {
              service_id: result.id,
              path: `/public/images/service/${result.id}/${file.originalname}`,
            },
            { transaction },
          );
        }
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(HTTPStatus.OK, Success, "Service créer avec succès"),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Update Service
 * */
export async function update(req, res, next) {
  try {
    const { user, files } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existService = await db.service.count({
      where: { id },
    });
    if (existService === 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Service n'existe pas");
    }
    if (body.nom) {
      const existServiceName = await db.service.count({
        where: {
          nom: body.nom,
          employe_id: user.id,
          id: {
            [Op.ne]: id,
          },
        },
      });
      if (existServiceName > 0) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Nom de la service existe déja",
        );
      }
    }

    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.service.update(
        {
          ...body,
        },
        {
          where: { id },
          transaction,
        },
      );
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Service non modifié",
        );
      }
      if (files && files.length > 0) {
        for await (const file of files) {
          await addDocument(file, id, "service");
          await db.image.create(
            {
              service_id: id,
              path: `/public/images/service/${id}/${file.originalname}`,
            },
            { transaction },
          );
        }
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Service modifié avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Destroy Contract
 * */
export async function destroy(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const existService = await db.service.count({
      where: Sequelize.and(
        { id },
        user.type === "EMPLOYE" ? { employe_id: user.id } : undefined,
      ),
    });
    if (existService === 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Service n'existe pas");
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.service.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Service non supprimé",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Service supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
