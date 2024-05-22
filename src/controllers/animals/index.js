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
  getAnimalById,
  getAnimals,
  getCountAnimals,
} from "../../models/animal";
import stream from "stream";
import JoiUpload from "joi";
import { MongoClient, ServerApiVersion } from "mongodb";
const Readable = stream.Readable;

const { Op } = Sequelize;
const requestWhiteList = {
  create: Object.keys({
    nom: Joi.string().max(200).required(),
    race: Joi.string().max(200).required(),
    habitat_id: Joi.number().positive().required(),
  }),
  update: Object.keys({
    nom: Joi.string().max(200).allow(),
    race: Joi.string().max(200).allow(),
    habitat_id: Joi.number().positive().allow(),
  }),
};

export const validation = {
  create: {
    body: JoiUpload.object({
      nom: Joi.string().max(200).required(),
      race: Joi.string().max(200).required(),
      habitat_id: Joi.number().positive().required(),
    }),
  },
  update: {
    body: Joi.object({
      nom: Joi.string().max(200).allow(),
      race: Joi.string().max(200).allow(),
      habitat_id: Joi.number().positive().allow(),
    }),
    params: {
      id: Joi.number().positive().required(),
    },
  },
};

/**
 * Get views for a given animal
 */
export async function getViewsForAnimal(animalId) {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    // Connect to mongoDB
    await client.connect();
    const database = client.db("amazoo");
    const views = database.collection("views");

    // Get previous views count
    const query = { animalId: parseInt(animalId) };
    const count = await views.countDocuments(query);

    return count;
  } catch (err) {
    return 0;
  }
}

/**
 * Increment animal views
 */

export async function incrementViews(req, res, next) {
  try {
    const { animal_id } = req.query;
    const client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    // Connect to mongoDB
    await client.connect();
    const database = client.db("amazoo");
    const views = database.collection("views");

    // Get previous views count
    const query = { animalId: parseInt(animal_id) };
    const previousViews = await views.countDocuments(query);

    // Increment views
    const view = { animalId: parseInt(animal_id), views: previousViews + 1 };
    const result = await views.insertOne(view);

    return res.status(HTTPStatus.OK).json(result);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Get List Of Animals
 * */
export async function getListAnimals(req, res, next) {
  try {
    // const { user } = req;
    // if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
    //   throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    // }
    const { limit, current_page, search, habitat_id } = req.query;
    let page = current_page || 1;
    let per_page = limit || 10;
    if (page < 1) page = 1;
    let offset = (page - 1) * per_page;
    const defaultValue = {
      order: [["id", "DESC"]],
      subQuery: false,
    };
    req.query.offset = offset;
    const parsedValue = parse(req.query, db.animal.rawAttributes);
    const values = {
      ...defaultValue,
      ...parsedValue,
    };
    let animals;
    let count;
    let countAll;
    await db.sequelize.transaction(async (transaction) => {
      countAll = await getCountAnimals(values, transaction, search, habitat_id);
      animals = await getAnimals(values, transaction, search, habitat_id);
      count = animals.length;
    });
    if (animals.length === 0) {
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
    pagination.data = animals;
    return res.status(HTTPStatus.OK).json(pagination);
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Create Animal
 * */
export async function create(req, res, next) {
  try {
    const { user, files } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const body = filteredBody(req.body, requestWhiteList.create);
    const existAnimal = await db.animal.count({
      where: { nom: body.nom, habitat_id: body.habitat_id },
    });
    if (existAnimal > 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Animal déja existe");
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.animal.create(
        {
          ...body,
        },
        { transaction },
      );
      if (!result) {
        throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Animal non créer");
      }
      if (files && files.length > 0) {
        for await (const file of files) {
          await addDocument(file, result.id, "animals");

          await db.image.create(
            {
              animal_id: result.id,
              path: `/public/images/animals/${result.id}/${file.originalname}`,
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
          "Animal créer avec succès",
          await getAnimalById(result.id),
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.BAD_REQUEST;
    return next(err);
  }
}

/**
 * Update Animal
 * */
export async function update(req, res, next) {
  try {
    const { user, files } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const body = filteredBody(req.body, requestWhiteList.update);
    const existAnimal = await db.animal.findOne({
      where: { id },
    });
    if (!existAnimal) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Animal n'existe pas");
    }
    if (body.nom) {
      const existAnimalName = await db.animal.count({
        where: {
          nom: body.nom,
          habitat_id: existAnimal.habitat_id,
          id: {
            [Op.ne]: id,
          },
        },
      });
      if (existAnimalName > 0) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Nom de l'Animal existe déja",
        );
      }
    }

    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.animal.update(
        {
          ...body,
        },
        {
          where: { id },
          transaction,
        },
      );
      if (!result) {
        throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Animal non modifié");
      }
      if (files && files.length > 0) {
        for await (const file of files) {
          await addDocument(file, id, "animals");
          await db.image.create(
            {
              animal_id: id,
              path: `/public/images/animals/${id}/${file.originalname}`,
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
          "Animal modifié avec succés",
          await getAnimalById(id),
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}

/**
 * Destroy Animal
 * */
export async function destroy(req, res, next) {
  try {
    const { user } = req;
    if (!hasRole(user, ["EMPLOYE", "ADMIN"])) {
      throw new APIError(HTTPStatus.NO_CONTENT, "error", "Non autorisé");
    }
    const { id } = req.params;
    const existAnimal = await db.animal.count({
      where: Sequelize.and({ id }),
    });
    if (existAnimal === 0) {
      throw new APIError(HTTPStatus.BAD_REQUEST, Error, "Animal n'existe pas");
    }
    let result;
    await db.sequelize.transaction(async (transaction) => {
      result = await db.animal.destroy({
        where: { id },
        transaction,
      });
      if (!result) {
        throw new APIError(
          HTTPStatus.BAD_REQUEST,
          Error,
          "Animal non supprimé",
        );
      }
    });
    return res
      .status(HTTPStatus.OK)
      .json(
        formatJSONResponse(
          HTTPStatus.CREATED,
          Success,
          "Animal supprimé avec succés",
        ),
      );
  } catch (err) {
    err.status = HTTPStatus.INTERNAL_SERVER_ERROR;
    return next(err);
  }
}
