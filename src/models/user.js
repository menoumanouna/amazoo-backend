"use strict";
import db from "../models";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { getViewsForUser } from "../controllers/users";

/**
 * Return User By Id
 */
export const getUserById = async (id) => {
  return db.users.findByPk(id, {
    attributes: ["id", "firstName", "lastName", "email", "status"],
  });
};
/**
 * Return Users
 */
export const getUsers = async (values, transaction, search) => {
  let users = await db.users.findAll({
    ...values,
    transaction,
    attributes: ["id", "firstName", "lastName", "email", "status"],
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
  return db.users.count({
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
  return db.users.create(values, { transaction });
};

/**
 * Update User
 */
export const updateUser = async (id, values, transaction) => {
  return db.users.update(values, {
    where: { id },
    transaction,
  });
};

/**
 * Delete User
 */
export const deleteUser = async (id, transaction) => {
  return db.users.destroy({
    where: { id },
    transaction,
  });
};

/**
 * Return Users Count
 */
export const getUsersCountForSearch = async (transaction, search) => {
  return db.users.count({
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
    "users",
    {
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      status: DataTypes.ENUM("ADMIN", "EMPLOYE", "VETERINAIRE"),
      date_creation: "created_at",
    },
    { timestamps: false },
  );
};
