"use strict";
import db from "../models";
import { Sequelize } from "sequelize-typescript";

/**
 * Return CommentAnimal By Id
 */
export const getCommentAnimalById = async (id) => {
  return db.commentaire_animal.findByPk(id, {
    attributes: ["id", "commentaire", "date_creation"],
  });
};
/**
 * Return CommentsAnimal
 */
export const getCommentsAnimal = async (
  values,
  transaction,
  utilisateur_id,
  animal_id,
) => {
  return await db.commentaire_animal.findAll({
    ...values,
    transaction,
    attributes: ["id", "commentaire", "date_creation"],
    include: [
      {
        model: db.utilisateur,
        attributes: ["id", "username"],
      },
      {
        model: db.animal,
        attributes: ["id", "nom"],
      },
    ],
    where: Sequelize.and(
      animal_id ? { animal_id } : undefined,
      utilisateur_id ? { utilisateur_id } : undefined,
    ),
  });
};
/**
 * Return Count CommentsAnimal
 */
export const getCountCommentsAnimal = async (
  values,
  transaction,
  utilisateur_id,
  animal_id,
) => {
  return await db.commentaire_animal.count({
    ...values,
    transaction,
    attributes: ["id"],
    where: Sequelize.and(
      animal_id ? { animal_id } : undefined,
      utilisateur_id ? { utilisateur_id } : undefined,
    ),
    group: ["id"],
  });
};
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "commentaire_animal",
    {
      commentaire: DataTypes.TEXT,
      date_creation: DataTypes.DATE,
      animal_id: DataTypes.INTEGER,
      utilisateur_id: DataTypes.INTEGER,
    },
    { timestamps: false },
  );
};
