"use strict";
import db from "../models";

import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";

/**
 * Return User By Id
 */
export const getUserById = async (id) => {
  return db.utilisateur.findByPk(id, {
    attributes: ["id", "username", "type", "date_creation"],
  });
};
/**
 * Return Users
 */
export const getUsers = async (values, transaction, search, role) => {
  return await db.utilisateur.findAll({
    ...values,
    transaction,
    attributes: ["id", "username", "type", "date_creation"],
    where: Sequelize.and(
      search
        ? {
            username: {
              [Op.like]: `%${search}%`,
            },
          }
        : undefined,
      role
        ? {
            type: {
              [Op.like]: `%${role}%`,
            },
          }
        : undefined,
    ),
  });
};
/**
 * Return Count users
 */
export const getCountUsers = async (values, transaction, search, role) => {
  return await db.utilisateur.count({
    ...values,
    transaction,
    attributes: ["id"],
    where: Sequelize.and(
      search
        ? {
            username: {
              [Op.like]: `%${search}%`,
            },
          }
        : undefined,
      role
        ? {
            type: {
              [Op.like]: `%${role}%`,
            },
          }
        : undefined,
    ),
    group: ["id"],
  });
};
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "utilisateur",
    {
      password: DataTypes.STRING,
      username: DataTypes.STRING,
      type: DataTypes.ENUM("ADMIN", "EMPLOYE", "VETERINAIRE"),
      date_creation: "created_at",
    },
    { timestamps: false },
  );
};
