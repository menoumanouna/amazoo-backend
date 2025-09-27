'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('images', [
      {
        id: 7,
        path: '/public/images/animals/lion.png',
        habitat_id: null,
        animal_id: 1,
        service_id: null
      },
      {
        id: 8,
        path: '/public/images/animals/elephant.png',
        habitat_id: null,
        animal_id: 2,
        service_id: null
      },
      {
        id: 9,
        path: '/public/images/animals/giraffe.png',
        habitat_id: null,
        animal_id: 3,
        service_id: null
      },
      {
        id: 10,
        path: '/public/images/animals/toucan_toco.jpeg',
        habitat_id: null,
        animal_id: 4,
        service_id: null
      },
      {
        id: 11,
        path: '/public/images/animals/dolphin.jpg',
        habitat_id: null,
        animal_id: 5,
        service_id: null
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('images', { animal_id: [1, 2, 3, 4, 5] }, {});
  }
};
