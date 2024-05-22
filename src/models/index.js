"use strict";

import user from "./user";
import image from "./images";
import service from "./service";
import habitat from "./habitat";
import animal from "./animal";
import compte_rendu from "./compte_rendu";
import commentaire_animal from "./commentaire_animal";
import nourriture from "./nourriture";
import commentaire_nourriture from "./commentaire_nourriture";

import config from "../../database/config";

require("dotenv").config();

const Sequelize = require("sequelize");

const { Op } = Sequelize;
const NODE_ENV = process.env.NODE_ENV;
//const db = {};
const options = config[NODE_ENV];
const operatorsAliases = {
  $like: Op.like,
  $not: Op.not,
};
//let sequelize;
const sequelize = new Sequelize(
  config[NODE_ENV].database,
  config[NODE_ENV].username,
  config[NODE_ENV].password,
  options,
  {
    operatorsAliases,
  },
);

const db = {
  sequelize,
};
const models = [
  user,
  image,
  service,
  habitat,
  animal,
  compte_rendu,
  commentaire_animal,
  commentaire_nourriture,
  nourriture,
];

models.forEach((modelFn) => {
  const model = modelFn(sequelize, Sequelize);
  db[model.name] = model;
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export const assoc = {
  UserService: db.utilisateur.hasMany(db.service, {
    foreignKey: "employe_id",
  }),
  ServiceUser: db.service.belongsTo(db.utilisateur, {
    foreignKey: "employe_id",
  }),
  UserReports: db.utilisateur.hasMany(db.compte_rendu, {
    foreignKey: "veterinaire_id",
  }),
  ReportsUser: db.compte_rendu.belongsTo(db.utilisateur, {
    foreignKey: "veterinaire_id",
  }),
  ReportsAnimal: db.compte_rendu.belongsTo(db.animal, {
    foreignKey: "animal_id",
  }),
  AnimalComment: db.commentaire_animal.belongsTo(db.animal, {
    foreignKey: "animal_id",
  }),
  UserComment: db.commentaire_animal.belongsTo(db.utilisateur, {
    foreignKey: "utilisateur_id",
  }),
  HabitatAnimals: db.habitat.hasMany(db.animal, {
    foreignKey: "habitat_id",
  }),
  AnimalsHabitat: db.animal.belongsTo(db.habitat, {
    foreignKey: "habitat_id",
  }),
  AnimalsImages: db.animal.hasMany(db.image, {
    foreignKey: "animal_id",
  }),
  ServicesImages: db.service.hasMany(db.image, {
    foreignKey: "service_id",
  }),
  HabitatImages: db.habitat.hasMany(db.image, {
    foreignKey: "habitat_id",
  }),
  NorAnimals: db.nourriture.belongsTo(db.animal, {
    foreignKey: "animal_id",
  }),
  NourritureComment: db.commentaire_nourriture.belongsTo(db.nourriture, {
    foreignKey: "nourriture_id",
  }),
  NourritureComment0: db.nourriture.hasMany(db.commentaire_nourriture, {
    foreignKey: "nourriture_id",
  }),
  UserNourritureComment0: db.utilisateur.hasMany(db.commentaire_nourriture, {
    foreignKey: "utilisateur_id",
  }),
  UserNourritureAnimal: db.commentaire_nourriture.belongsTo(db.utilisateur, {
    foreignKey: "utilisateur_id",
  }),
};

export default db;
