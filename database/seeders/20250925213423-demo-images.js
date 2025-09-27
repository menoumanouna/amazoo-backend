'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('images', [
      {
        id: 1,
        path: '/public/images/habitats/1/habitat_terrestres.png',
        habitat_id: 1,
        animal_id: null,
        service_id: null
      },
      {
        id: 2,
        path: '/public/images/habitats/2/habitat_aeriens.png',
        habitat_id: 2,
        animal_id: null,
        service_id: null
      },
      {
        id: 3,
        path: '/public/images/habitats/3/habitat_aquatiques.png',
        habitat_id: 3,
        animal_id: null,
        service_id: null
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('images', null, {});
  }
};
