require("dotenv").config();

module.exports = {
  options: {
    action: "read",
    expires: "03-17-2035",
  },
  JWT_SECRET: process.env.JWT_SECRET_DEV,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "24h",

  development: {
    // url: 'jdbc:postgresql://localhost/fakademy-dev',
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || "database_test",
    host: process.env.DB_HOST || "127.0.0.1",
    operatorsAliases: 1,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: { encrypt: true },
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData",
    define: {
      freezeTableName: false,
      underscored: false,
      paranoid: false,
    },
  },
  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || "database_test",
    host: process.env.DB_HOST || "127.0.0.1",
    operatorsAliases: 1,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: { encrypt: true },
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData",
    define: {
      freezeTableName: true,
      underscored: true,
      // paranoid: true,
    },
  },
  production: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || "database_production",
    host: process.env.DB_HOST || "127.0.0.1",
    operatorsAliases: 1,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: { encrypt: true },
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData",
    define: {
      freezeTableName: true,
      underscored: true,
      // paranoid: true,
    },
  },
};
