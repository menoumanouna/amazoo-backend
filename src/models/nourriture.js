"use strict";
import db from "../models";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";

/**
 * Return Nourriture By Id
 */
export const getNourritureById = async (id) => {
  return db.nourriture.findByPk(id, {
    attributes: ["id", "name", "quantity", "date"],
  });
};
/**
 * Return Nourritures
 */
export const getNourritures = async (values, transaction, search) => {
  return await db.nourriture.findAll({
    ...values,
    transaction,
    attributes: ["id", "name", "quantity", "date"],
    include: [
      {
        model: db.animal,
        attributes: ["id", "nom", "race"],
      },
    ],
    where: Sequelize.and(
      search
        ? {
            name: {
              [Op.like]: `%${search}%`,
            },
          }
        : undefined,
    ),
  });
};
/**
 * Return Count Nourritures
 */
export const getCountNourritures = async (values, transaction, search) => {
  return await db.nourriture.count({
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
    "nourriture",
    {
      name: DataTypes.STRING,
      quantity: DataTypes.STRING,
      date: DataTypes.DATE,
      animal_id: DataTypes.INTEGER,
    },
    { timestamps: false },
  );
};
