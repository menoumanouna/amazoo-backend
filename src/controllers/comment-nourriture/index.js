import HTTPStatus from "http-status";
// models
import db from "../../models";

// helpers
import { Error, formatJSONResponse, Success } from "../../utils/helpres";
import { filteredBody } from "../../utils/filteredBody";
import APIError from "../../services/error";

import { Joi } from "celebrate";
import { Sequelize } from "sequelize-typescript";
import { parse } from "../../services/parser";
import {
  getCommentNourritureById,
  getCommentsNourritures,
  getCountCommentsNourritures,
} from "../../models/commentaire_nourriture";

const requestWhiteList = {
  create: Object.keys({
    commentaire: Joi.string().max(500).required(),
    nourriture_id: Joi.number().positive().required(),
  }),
  update: Object.keys({
    commentaire: Joi.string().max(500).allow(),
    nourriture_id: Joi.number().positive().allow(),
  }),
};

export const validation = {
  create: {
    body: Joi.object({
      commentaire: Joi.string().max(500).required(),
      nourriture_id: Joi.number().positive().required(),
    }),
  },
  update: {
    body: Joi.object({
      commentaire: Joi.string().max(500).allow(),
      nourriture_id: Joi.number().positive().allow(),
    }),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};
/**
 * Get List Of Comment Nourriture
 * */
export async function getListCommentNourriture(req, res, next) {
  try {
    const { limit, current_page, search, animal_id, userId } = req.query;
    let page = current_page || 1;
    let per_page = limit || 10;
    if (page < 1) page = 1;
    let offset = (page - 1) * per_page;
    const defaultValue = {
      order: [["id", "DESC"]],
      subQuery: false,
    };

    req.query.offset = offset;
    const parsedValue = parse(
      req.query,
      db.commentaire_nourriture.rawAttributes,
    );
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let nourritures;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountCommentsNourritures(
        values,
        transaction,
        userId,
        animal_id,
      );
      nourritures = await getCommentsNourritures(
        values,
        transaction,
        userId,
        animal_id,
      );
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
 * Create Comment nourriture
 * */
export async function create(req, res, next) {
  try {
    const { user } = req;

    const body = filteredBody(req.body, requestWhiteList.create);
    let result;
    const existNourriture = await db.nourriture.count({
      where: { id: body.nourriture_id },
    });
    if (existNourriture === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Nourriture n'existe pas",
      );
    }
    await db.sequelize.transaction(async (transaction) => {
      body.utilisateur_id = user?.id;
      result = await db.commentaire_nourriture.create(
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
          result,
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Update Comment nourriture
 * */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existNourritureComment = await db.commentaire_nourriture.count({
      where: { id },
    });
    if (existNourritureComment === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Nourriture comment n'existe pas",
      );
    }
    if (body.nourriture_id) {
      const existNourriture = await db.nourriture.count({
        where: { id: body.nourriture_id },
      });
      if (existNourriture === 0) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Nourriture n'existe pas",
        );
      }
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.commentaire_nourriture.update(
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
          await getCommentNourritureById(id),
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Destroy Comment nourriture
 * */
export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    const existNourritureComment = await db.commentaire_nourriture.count({
      where: Sequelize.and({ id }),
    });
    if (existNourritureComment === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Nourriture n'existe pas",
      );
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.commentaire_nourriture.destroy({
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
