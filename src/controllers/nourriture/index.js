import HTTPStatus from "http-status";
// models
import db from "../../models";

// helpers
import {
  Error,
  formatJSONResponse,
  hasRole,
  Success,
} from "../../utils/helpres";
import { filteredBody } from "../../utils/filteredBody";
import APIError from "../../services/error";

import { Joi } from "celebrate";
import { Sequelize } from "sequelize-typescript";
import { parse } from "../../services/parser";

import { getCountNourritures, getNourritures } from "../../models/nourriture";
const { Op } = Sequelize;
const requestWhiteList = {
  create: Object.keys({
    name: Joi.string().max(200).required(),
    quantity: Joi.string().max(1000).required(),
    date: Joi.date().required(),
    animal_id: Joi.number().positive().required(),
  }),
  update: Object.keys({
    name: Joi.string().max(200).allow(),
    quantity: Joi.string().max(1000).allow(),
    date: Joi.date().allow(),
    animal_id: Joi.number().positive().allow(),
  }),
};

export const validation = {
  create: {
    body: Joi.object({
      name: Joi.string().max(200).required(),
      quantity: Joi.string().max(1000).required(),
      date: Joi.date().required(),
      animal_id: Joi.number().positive().required(),
    }),
  },
  update: {
    body: Joi.object({
      name: Joi.string().max(200).allow(),
      quantity: Joi.string().max(1000).allow(),
      date: Joi.date().allow(),
      animal_id: Joi.number().positive().allow(),
    }),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};
/**
 * Get List Of nourritures
 * */
export async function getListNourritures(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { limit, current_page, search } = req.query;
    let page = current_page || 1;
    let per_page = limit || 10;
    if (page < 1) page = 1;
    let offset = (page - 1) * per_page;
    const defaultValue = {
      order: [["id", "DESC"]],
      subQuery: false,
    };
    req.query.offset = offset;
    const parsedValue = parse(req.query, db.nourriture.rawAttributes);
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let nourritures;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountNourritures(values, transaction, search);
      nourritures = await getNourritures(values, transaction, search);
      count = nourritures.length;
    });
    if (nourritures.length === 0) {
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
    pagination.data = nourritures;
    return res.status(HTTPStatus.OK).json(pagination);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Create Nourriture
 * */
export async function create(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const body = filteredBody(req.body, requestWhiteList.create);
    const existNourriture = await db.nourriture.count({
      where: { name: body.name },
    });

    if (existNourriture > 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Nourriture déja existe",
      );
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.nourriture.create(
        {
          ...body,
        },
        { transaction },
      );
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Nourriture non créer",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.OK,
          Success,
          "Nourriture créer avec succès",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Update Nourriture
 * */
export async function update(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existNourriture = await db.nourriture.count({
      where: { id },
    });
    if (existNourriture === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Nourriture n'existe pas",
      );
    }
    if (body.nom) {
      const existNourritureName = await db.nourriture.count({
        where: {
          name: body.name,
          id: {
            [Op.ne]: id,
          },
        },
      });
      if (existNourritureName > 0) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Nom de la nourriture existe déja",
        );
      }
    }

    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.nourriture.update(
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
          "Nourriture non modifié",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Nourriture modifié avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Destroy Nourriture
 * */
export async function destroy(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const existNourriture = await db.nourriture.count({
      where: Sequelize.and({ id }),
    });
    if (existNourriture === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Nourriture n'existe pas",
      );
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.nourriture.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Nourriture non supprimé",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Nourriture supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
