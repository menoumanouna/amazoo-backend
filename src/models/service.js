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
        model: db.users,
        attributes: ["id", "firstName", "lastName"],
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
        model: db.users,
        attributes: ["id", "firstName", "lastName"],
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
 * Return Services Count
 */
export const getCountService = async (values, transaction, search, employe_id) => {
  return db.service.count({
    ...values,
    transaction,
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
 * Create Service
 */
export const createService = async (values, transaction) => {
  return db.service.create(values, { transaction });
};

/**
 * Update Service
 */
export const updateService = async (id, values, transaction) => {
  return db.service.update(values, {
    where: { id },
    transaction,
  });
};

/**
 * Delete Service
 */
export const deleteService = async (id, transaction) => {
  return db.service.destroy({
    where: { id },
    transaction,
  });
};

/**
 * Return Services Count
 */
export const getServicesCountForSearch = async (transaction, search) => {
  return db.service.count({
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
    "service",
    {
      nom: DataTypes.STRING,
      description: DataTypes.STRING,
      horaire: DataTypes.TIME,
      employe_id: DataTypes.STRING,
    },
    { timestamps: false },
  );
};
