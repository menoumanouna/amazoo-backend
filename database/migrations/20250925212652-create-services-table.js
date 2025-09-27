'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      horaire: {
        type: Sequelize.TIME
      },
      employe_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('services');
  }
};
