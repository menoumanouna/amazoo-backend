import HTTPStatus from "http-status";
// models
import passwordHash from "password-hash";
import { Joi } from "celebrate";
import db from "../../models";
// helpers
import {
  Error,
  formatJSONResponse,
  hasRole,
  Success,
} from "../../utils/helpres";
import APIError from "../../services/error";
import {
  createValidationBodyUser,
  updateValidationBodyUser,
} from "../../utils/validation";
import { filteredBody } from "../../utils/filteredBody";
import { getCountUsers, getUserById, getUsers } from "../../models/user";
import { parse } from "../../services/parser";
import { Sequelize } from "sequelize-typescript";
const { Op } = Sequelize;

const requestWhiteList = {
  create: Object.keys(createValidationBodyUser),
  update: Object.keys(updateValidationBodyUser),
};
export const validation = {
  create: {
    body: Joi.object(createValidationBodyUser),
  },
  update: {
    body: Joi.object(updateValidationBodyUser),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};

/**
 * Get List Of Users
 * */
export async function getListUsers(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { limit, current_page, search, role } = req.query;
    let page = current_page || 1;
    let per_page = limit || 10;
    if (page < 1) page = 1;
    let offset = (page - 1) * per_page;
    const defaultValue = {
      order: [["id", "DESC"]],
      subQuery: false,
    };
    req.query.offset = offset;
    const parsedValue = parse(req.query, db.utilisateur.rawAttributes);
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let users;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountUsers(values, transaction, search, role);
      users = await getUsers(values, transaction, search, role);
      count = users.length;
    });
    if (users.length === 0) {
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
    pagination.data = users;
    return res.status(HTTPStatus.OK).json(pagination);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Create User
 * */
export async function create(req, res, next) {
  try {
    const body = filteredBody(req.body, requestWhiteList.create);
    const existUser = await db.utilisateur.findOne({
      where: {
        username: body.username,
      },
    });
    if (existUser) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Utilisateur déja existe",
      );
    }

    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.utilisateur.create(
        {
          ...body,
          username: body.username.toLowerCase(),
          password: passwordHash.generate(body.password),
          date_creation: new Date(),
        },
        { transaction },
      );
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Utilisateur non créer",
        );
      }
    });
    const user = await getUserById(result.id);
    return res
      .status(HTTPStatus.OK)
      .json(formatJSONResponse(HTTPStatus.OK, Success, "", user));
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Create User
 * */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existUser = await db.utilisateur.findOne({
      where: {
        id,
      },
    });
    if (!existUser) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Utilisateur non existe",
      );
    }
    const existUserName = await db.utilisateur.findOne({
      where: {
        username: body.username.toLowerCase(),
        id: {
          [Op.ne]: id,
        },
      },
    });
    if (existUserName) {
      throw new APIError(
        HTTPStatus.BAD_REQUEST,
        Error,
        "Utilisateur déja existe",
      );
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.utilisateur.update(
        {
          username: body.username.toLowerCase(),
        },
        { where: { id }, transaction },
      );
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Utilisateur non modifié",
        );
      }
    });

    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(HTTPStatus.OK, Success, "", await getUserById(id)),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Destroy Users
 * */
export async function destroy(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.utilisateur.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Utilisateur non supprimé",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Utilisateur supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
