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
import { getCountReports, getReports } from "../../models/compte_rendu";
const requestWhiteList = {
  create: Object.keys({
    etat_animal: Joi.string().max(1000).required(),
    detail_etat_animal: Joi.string().max(1000).allow(),
    type_nourriture: Joi.string().required(),
    quantite_nourriture: Joi.string().required(),
    animal_id: Joi.number().positive().required(),
  }),
  update: Object.keys({
    etat_animal: Joi.string().max(1000).allow(),
    detail_etat_animal: Joi.string().max(1000).allow(),
    type_nourriture: Joi.string().allow(),
    quantite_nourriture: Joi.string().allow(),
    animal_id: Joi.number().positive().allow(),
  }),
};

export const validation = {
  create: {
    body: Joi.object({
      etat_animal: Joi.string().max(1000).required(),
      detail_etat_animal: Joi.string().max(1000).allow(),
      type_nourriture: Joi.string().required(),
      quantite_nourriture: Joi.string().required(),
      animal_id: Joi.number().positive().required(),
      veterinaire_id: Joi.number().positive().required(),
    }),
  },
  update: {
    body: Joi.object({
      etat_animal: Joi.string().max(1000).allow(),
      detail_etat_animal: Joi.string().max(1000).allow(),
      type_nourriture: Joi.string().allow(),
      quantite_nourriture: Joi.string().allow(),
      animal_id: Joi.number().positive().allow(),
    }),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};
/**
 * Get List Of Contract
 * */
export async function getListReports(req, res, next) {
  try {
    // const { user } = req;
    // if (!hasRole(user, ["VETERINAIRE", "ADMIN"])) {
    //   throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    // }
    const { limit, current_page, search, animal_id } = req.query;
    let page = current_page || 1;
    let per_page = limit || 10;
    if (page < 1) page = 1;
    let offset = (page - 1) * per_page;
    const defaultValue = {
      order: [["id", "DESC"]],
      subQuery: false,
    };
    req.query.offset = offset;
    const parsedValue = parse(req.query, db.compte_rendu.rawAttributes);
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let reports;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountReports(values, transaction, search, animal_id);
      reports = await getReports(values, transaction, search, animal_id);
      count = reports.length;
    });
    if (reports.length === 0) {
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
    pagination.data = reports;
    return res.status(HTTPStatus.OK).json(pagination);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Create Report
 * */
export async function create(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["VETERINAIRE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const body = filteredBody(req.body, requestWhiteList.create);

    let result;
    await db.sequelize.transaction(async (transaction) => {
      body.veterinaire_id = user.id;
      result = await db.compte_rendu.create(
        {
          ...body,
        },
        { transaction },
      );
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Compte rendus non créer",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.OK,
          Success,
          "Compte rendus créer avec succès",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Update Report
 * */
export async function update(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["VETERINAIRE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existReport = await db.compte_rendu.count({
      where: { id },
    });
    if (existReport === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Compte rendus n'existe pas",
      );
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.compte_rendu.update(
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
          "Compte rendus non modifié",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Compte rendus modifié avec succés",
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
    if (!hasRole(user, ["VETERINAIRE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const existReport = await db.compte_rendu.count({
      where: Sequelize.and(
        { id },
        user.type === "VETERINAIRE" ? { veterinaire_id: user.id } : undefined,
      ),
    });
    if (existReport === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Compte rendus n'existe pas",
      );
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.compte_rendu.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Compte rendus non supprimé",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Compte rendus supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
