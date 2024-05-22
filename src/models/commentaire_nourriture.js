"use strict";
import db from "../models";
import { Sequelize } from "sequelize-typescript";

/**
 * Return CommentaireNourriture By Id
 */
export const getCommentNourritureById = async (id) => {
  return db.commentaire_nourriture.findByPk(id, {
    attributes: ["id", "commentaire", "date_creation"],
  });
};
/**
 * Return CommentaireNourriture
 */
export const getCommentsNourritures = async (
  values,
  transaction,
  utilisateur_id,
  nourriture_id,
) => {
  return await db.commentaire_nourriture.findAll({
    ...values,
    transaction,
    attributes: ["id", "commentaire", "date_creation"],
    include: [
      {
        model: db.utilisateur,
        attributes: ["id", "username"],
      },
      {
        model: db.nourriture,
        attributes: ["id", "name"],
      },
    ],
    where: Sequelize.and(
      nourriture_id ? { nourriture_id } : undefined,
      utilisateur_id ? { utilisateur_id } : undefined,
    ),
  });
};
/**
 * Return Count CommentNourriture
 */
export const getCountCommentsNourritures = async (
  values,
  transaction,
  utilisateur_id,
  nourriture_id,
) => {
  return await db.commentaire_nourriture.count({
    ...values,
    transaction,
    attributes: ["id"],
    where: Sequelize.and(
      nourriture_id ? { nourriture_id } : undefined,
      utilisateur_id ? { utilisateur_id } : undefined,
    ),
    group: ["id"],
  });
};
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "commentaire_nourriture",
    {
      commentaire: DataTypes.TEXT,
      date_creation: DataTypes.DATE,
      nourriture_id: DataTypes.INTEGER,
      utilisateur_id: DataTypes.INTEGER,
    },
    { timestamps: false },
  );
};
