"use strict";
import db from "../models";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { getViewsForAnimal } from "../controllers/animals";

/**
 * Return Animal By Id
 */
export const getAnimalById = async (id) => {
  return db.animal.findByPk(id, {
    attributes: ["id", "race", "nom", "date_creation"],
    include: [
      {
        model: db.image,
        attributes: ["id", "path"],
      },
    ],
  });
};
/**
 * Return Animals
 */
export const getAnimals = async (values, transaction, search, habitat_id) => {
  let animals = await db.animal.findAll({
    ...values,
    transaction,
    attributes: ["id", "nom", "race", "date_creation", "habitat_id"],
    include: [
      {
        model: db.image,
        attributes: ["id", "path"],
      },
    ],
    where: Sequelize.and(
      habitat_id ? { habitat_id } : undefined,
      search
        ? {
            nom: {
              [Op.like]: `%${search}%`,
            },
          }
        : undefined,
    ),
  });
  const animalsWithViews = await Promise.all(
    animals.map(async (animal) => {
      const animalObj = animal.get({ plain: true });
      return {
        ...animalObj,
        views: await getViewsForAnimal(animal.id),
      };
    }),
  );

  return animalsWithViews;
};

/**
 * Return Count Animal
 */
export const getCountAnimals = async (
  values,
  transaction,
  search,
  habitat_id,
) => {
  return await db.animal.count({
    ...values,
    transaction,
    attributes: ["id"],
    where: Sequelize.and(
      habitat_id ? { habitat_id } : undefined,
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
    "animal",
    {
      nom: DataTypes.STRING,
      race: DataTypes.STRING,
      habitat_id: DataTypes.INTEGER,
      date_creation: DataTypes.DATE,
    },
    { timestamps: false },
  );
};
