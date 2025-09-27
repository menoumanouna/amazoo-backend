'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      habitat_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'habitats',
          key: 'id'
        }
      },
      animal_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'animals',
          key: 'id'
        }
      },
      service_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'services',
          key: 'id'
        }
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('images');
  }
};
