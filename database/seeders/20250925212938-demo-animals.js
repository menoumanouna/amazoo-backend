'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('animals', [
      {
        id: 1,
        nom: 'Simba',
        race: 'Lion',
        habitat_id: 1,
        date_creation: new Date()
      },
      {
        id: 2,
        nom: 'Dumbo',
        race: 'Éléphant d\'Afrique',
        habitat_id: 1,
        date_creation: new Date()
      },
      {
        id: 3,
        nom: 'Gigi',
        race: 'Girafe',
        habitat_id: 1,
        date_creation: new Date()
      },
      {
        id: 4,
        nom: 'Charlie',
        race: 'Toucan',
        habitat_id: 2,
        date_creation: new Date()
      },
      {
        id: 5,
        nom: 'Flipper',
        race: 'Dauphin',
        habitat_id: 3,
        date_creation: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('animals', null, {});
  }
};
