'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('images', [
      {
        id: 4,
        path: '/public/images/service/1/service_visite_train.png',
        habitat_id: null,
        animal_id: null,
        service_id: 1
      },
      {
        id: 5,
        path: '/public/images/service/2/service_visite_groupe.png',
        habitat_id: null,
        animal_id: null,
        service_id: 2
      },
      {
        id: 6,
        path: '/public/images/service/3/service_restau.png',
        habitat_id: null,
        animal_id: null,
        service_id: 3
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('images', { service_id: [1, 2, 3] }, {});
  }
};
