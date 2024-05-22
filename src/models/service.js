"use strict";
import db from "../models";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";

/**
 * Return Service By Id
 */
export const getServiceById = async (id) => {
  return db.service.findByPk(id, {
    attributes: ["id", "description", "nom", "horaire"],
    include: [
      {
        model: "utilisateur",
        attributes: ["id", "username"],
      },
    ],
  });
};
/**
 * Return Services
 */
export const getServices = async (values, transaction, search, employe_id) => {
  return await db.service.findAll({
    ...values,
    transaction,
    attributes: ["id", "nom", "description", "horaire"],
    include: [
      {
        model: db.utilisateur,
        attributes: ["id", "username"],
      },
      {
        model: db.image,
        attributes: ["id", "path"],
      },
    ],
    where: Sequelize.and(
      employe_id ? { employe_id } : undefined,
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
 * Return Count Service
 */
export const getCountService = async (
  values,
  transaction,
  search,
  employe_id,
) => {
  return await db.service.count({
    ...values,
    transaction,
    attributes: ["id"],
    where: Sequelize.and(
      employe_id ? { employe_id } : undefined,
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
    "service",
    {
      nom: DataTypes.STRING,
      description: DataTypes.STRING,
      horaire: DataTypes.TIME,
      employe_id: DataTypes.INTEGER,
    },
    { timestamps: false },
  );
};
