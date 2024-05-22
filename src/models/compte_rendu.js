"use strict";
import db from "../models";
import { Sequelize } from "sequelize-typescript";

/**
 * Return Report By Id
 */
export const getReportById = async (id) => {
  return db.compte_rendu.findByPk(id, {
    attributes: [
      "id",
      "etat_animal",
      "detail_etat_animal",
      "type_nourriture",
      "quantite_nourriture",
      "date_passage",
    ],
    include: [
      {
        model: db.utilisateur,
        attributes: ["id", "username"],
      },
      {
        model: db.animal_id,
        attributes: ["id", "nom"],
      },
    ],
  });
};
/**
 * Return Reports
 */
export const getReports = async (values, transaction, search, animal_id) => {
  return await db.compte_rendu.findAll({
    ...values,
    transaction,
    attributes: [
      "id",
      "etat_animal",
      "detail_etat_animal",
      "type_nourriture",
      "quantite_nourriture",
      "date_passage",
      "animal_id",
    ],
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
    where: animal_id ? { animal_id } : undefined,
  });
};
/**
 * Return Count Reports
 */
export const getCountReports = async (
  values,
  transaction,
  search,
  veterinaire_id,
) => {
  return await db.compte_rendu.count({
    ...values,
    transaction,
    attributes: ["id"],
    where: Sequelize.and(veterinaire_id ? { veterinaire_id } : undefined),
    group: ["id"],
  });
};
export default (sequelize, DataTypes) => {
  return sequelize.define(
    "compte_rendu",
    {
      etat_animal: DataTypes.TEXT,
      detail_etat_animal: DataTypes.TEXT,
      type_nourriture: DataTypes.STRING,
      quantite_nourriture: DataTypes.STRING,
      date_passage: DataTypes.DATE,
      veterinaire_id: DataTypes.INTEGER,
      animal_id: DataTypes.INTEGER,
    },
    { timestamps: false },
  );
};
