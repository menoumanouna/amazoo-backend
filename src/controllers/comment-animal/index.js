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
  getCommentsAnimal,
  getCountCommentsAnimal,
  getCommentAnimalById,
} from "../../models/commentaire_animal";

const requestWhiteList = {
  create: Object.keys({
    commentaire: Joi.string().max(500).required(),
    animal_id: Joi.number().positive().required(),
  }),
  update: Object.keys({
    commentaire: Joi.string().max(500).allow(),
    animal_id: Joi.number().positive().allow(),
  }),
};

export const validation = {
  create: {
    body: Joi.object({
      commentaire: Joi.string().max(500).required(),
      animal_id: Joi.number().positive().required(),
    }),
  },
  update: {
    body: Joi.object({
      commentaire: Joi.string().max(500).allow(),
      animal_id: Joi.number().positive().allow(),
    }),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};
/**
 * Get List Of Comment Animals
 * */
export async function getListCommentAnimals(req, res, next) {
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
    const parsedValue = parse(req.query, db.commentaire_animal.rawAttributes);
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let habitats;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountCommentsAnimal(
        values,
        transaction,
        userId,
        animal_id,
      );
      habitats = await getCommentsAnimal(
        values,
        transaction,
        userId,
        animal_id,
      );
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
 * Create Comment Animal
 * */
export async function create(req, res, next) {
  try {
    const { user } = req;

    const body = filteredBody(req.body, requestWhiteList.create);
    let result;
    await db.sequelize.transaction(async (transaction) => {
      body.utilisateur_id = user?.id;
      result = await db.commentaire_animal.create(
        {
          ...body,
        },
        { transaction },
      );
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Commentaire non créer",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.OK,
          Success,
          "Commentaire créer avec succès",
          result,
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Update Comment Animal
 * */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existHabitat = await db.commentaire_animal.count({
      where: { id },
    });
    if (existHabitat === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Commentaire n'existe pas",
      );
    }

    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.commentaire_animal.update(
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
          "Commentaire non modifié",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Commentaire modifié avec succés",
          await getCommentAnimalById(id),
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Destroy Comment Animal
 * */
export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    const existHabitat = await db.commentaire_animal.count({
      where: Sequelize.and({ id }),
    });
    if (existHabitat === 0) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Commentaire n'existe pas",
      );
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.commentaire_animal.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Commentaire non supprimé",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Commentaire supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
