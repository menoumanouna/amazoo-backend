'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('habitats', [
      {
        id: 1,
        nom: 'Savane Africaine',
        description: 'Habitat spacieux reproduisant les conditions de la savane africaine',
        category_id: 1,
        date_creation: new Date()
      },
      {
        id: 2,
        nom: 'Forêt Tropicale',
        description: 'Environnement humide et chaud pour les espèces tropicales',
        category_id: 2,
        date_creation: new Date()
      },
      {
        id: 3,
        nom: 'Bassin Aquatique',
        description: 'Grand bassin pour les mammifères marins',
        category_id: 3,
        date_creation: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('habitats', null, {});
  }
};
