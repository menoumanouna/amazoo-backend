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
import { parse } from "../../services/parser";
import {
  getCountHabitats,
  getHabitatById,
  getHabitats,
} from "../../models/habitat";
const { Op } = Sequelize;
const requestWhiteList = {
  create: Object.keys({
    nom: Joi.string().max(200).required(),
    description: Joi.string().max(1000).required(),
    category_id: Joi.number().positive().required(),
  }),
  update: Object.keys({
    nom: Joi.string().max(200).allow(),
    description: Joi.string().max(1000).allow(),
    category_id: Joi.number().positive().allow(),
  }),
};

export const validation = {
  create: {
    body: Joi.object({
      nom: Joi.string().max(200).required(),
      description: Joi.string().max(1000).required(),
      category_id: Joi.number().positive().required(),
    }),
  },
  update: {
    body: Joi.object({
      nom: Joi.string().max(200).allow(),
      description: Joi.string().max(1000).allow(),
      category_id: Joi.number().positive().allow(),
    }),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};
/**
 * Get List Of Habitats
 * */
export async function getListHabitats(req, res, next) {
  try {
    // const { user } = req;
    // if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
    //   throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    // }
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
    const parsedValue = parse(req.query, db.habitat.rawAttributes);
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let habitats;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountHabitats(values, transaction, search);
      habitats = await getHabitats(values, transaction, search);
      count = habitats.length;
    });
    if (habitats.length === 0) {
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
    pagination.data = habitats;
    return res.status(HTTPStatus.OK).json(pagination);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Create Habitat
 * */
export async function create(req, res, next) {
  try {
    const { user, files } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const body = filteredBody(req.body, requestWhiteList.create);
    const existHabitat = await db.habitat.count({
      where: { nom: body.nom },
    });

    if (existHabitat > 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Habitat déja existe");
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.habitat.create(
        {
          ...body,
        },
        { transaction },
      );
      if (!result) {
        throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Habitat non créer");
      }
      if (files && files.length > 0) {
        for await (const file of files) {
          await addDocument(file, result.id, "habitats");

          await db.image.create(
            {
              habitat_id: result.id,
              path: `/public/images/habitats/${result.id}/${file.originalname}`,
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
          HTTPStatus.OK,
          Success,
          "Habitat créer avec succès",
          await getHabitatById(result.id),
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Update Habitat
 * */
export async function update(req, res, next) {
  try {
    const { user, files } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existHabitat = await db.habitat.count({
      where: { id },
    });
    if (existHabitat === 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Habitat n'existe pas");
    }
    if (body.nom) {
      const existHabitatName = await db.habitat.count({
        where: {
          nom: body.nom,
          id: {
            [Op.ne]: id,
          },
        },
      });
      if (existHabitatName > 0) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Nom de l'habitat existe déja",
        );
      }
    }

    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.habitat.update(
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
          "Habitat non modifié",
        );
      }
      if (files && files.length > 0) {
        for await (const file of files) {
          await addDocument(file, id, "habitats");

          await db.image.create(
            {
              habitat_id: id,
              path: `/public/images/habitats/${id}/${file.originalname}`,
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
          "Habitat modifié avec succés",
          await getHabitatById(id),
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Destroy Habitat
 * */
export async function destroy(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const existHabitat = await db.habitat.count({
      where: Sequelize.and(
        { id },
        user.type === "EMPLOYE" ? { employe_id: user.id } : undefined,
      ),
    });
    if (existHabitat === 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Habitat n'existe pas");
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.habitat.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Habitat non supprimé",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Habitat supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
