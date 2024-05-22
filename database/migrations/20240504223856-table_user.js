"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users", {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      country: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pseudo: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      photo: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      passwordCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verificationCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("pending", "accepted", "canceled"),
      },
      created_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("users");
  },
};
