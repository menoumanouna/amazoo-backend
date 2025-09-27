"use strict";
import db from "../models";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { getViewsForUser } from "../controllers/users";

/**
 * Return User By Id
 */
export const getUserById = async (id) => {
  return db.user.findByPk(id, {
    attributes: ["id", "firstName", "lastName", "email", "country"],
  });
};
/**
 * Return Users
 */
export const getUsers = async (values, transaction, search) => {
  let users = await db.user.findAll({
    ...values,
    transaction,
    attributes: ["id", "firstName", "lastName", "email", "country"],
    where: search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined,
  });
  return users;
};

/**
 * Return Users Count
 */
export const getUsersCount = async (transaction, search) => {
  return db.user.count({
    transaction,
    where: search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined,
  });
};

/**
 * Create User
 */
export const createUser = async (values, transaction) => {
  return db.user.create(values, { transaction });
};

/**
 * Update User
 */
export const updateUser = async (id, values, transaction) => {
  return db.user.update(values, {
    where: { id },
    transaction,
  });
};

/**
 * Delete User
 */
export const deleteUser = async (id, transaction) => {
  return db.user.destroy({
    where: { id },
    transaction,
  });
};

/**
 * Return Users Count
 */
export const getUsersCountForSearch = async (transaction, search) => {
  return db.user.count({
    transaction,
    attributes: ["id"],
    where: search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        }
      : undefined,
    group: ["id"],
  });
};
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      password: DataTypes.STRING,
      username: DataTypes.STRING,
      type: DataTypes.ENUM("ADMIN", "EMPLOYE", "VETERINAIRE"),
      date_creation: "created_at",
    },
    { timestamps: false },
  );
};
