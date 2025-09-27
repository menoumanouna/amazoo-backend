'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('animals', {
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
      race: {
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
      date_creation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('animals');
  }
};
