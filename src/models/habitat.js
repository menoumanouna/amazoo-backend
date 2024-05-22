"use strict";
import db from "../models";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";

/**
 * Return Habitat By Id
 */
export const getHabitatById = async (id) => {
  return db.habitat.findByPk(id, {
    attributes: ["id", "description", "nom", "date_creation"],
    include: [
      {
        model: db.animal,
        attributes: ["id", "nom", "race"],
        include: [
          {
            model: db.image,
            attributes: ["id", "path"],
          },
        ],
      },
      {
        model: db.image,
        attributes: ["id", "path"],
      },
    ],
  });
};
/**
 * Return Habitats
 */
export const getHabitats = async (values, transaction, search) => {
  return await db.habitat.findAll({
    ...values,
    transaction,
    attributes: ["id", "nom", "description", "date_creation", "category_id"],
    include: [
      {
        model: db.animal,
        attributes: ["id", "nom", "race"],
        include: [
          {
            model: db.image,
            attributes: ["id", "path"],
          },
        ],
      },
      {
        model: db.image,
        attributes: ["id", "path"],
      },
    ],
    where: Sequelize.and(
      search
        ? {
            nom: {
              [Op.like]: `%${search}%`,
            },
          }
        : undefined,
    ),
  });
};
/**
 * Return Count Habitats
 */
export const getCountHabitats = async (values, transaction, search) => {
  return await db.habitat.count({
    ...values,
    transaction,
    attributes: ["id"],
    where: Sequelize.and(
      search
        ? {
            nom: {
              [Op.like]: `%${search}%`,
            },
          }
        : undefined,
    ),
    group: ["id"],
  });
};
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "habitat",
    {
      nom: DataTypes.STRING,
      description: DataTypes.STRING,
      date_creation: DataTypes.DATE,
      category_id: DataTypes.INTEGER,
    },
    { timestamps: false },
  );
};
