'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('services', [
      {
        id: 1,
        nom: 'Visite en Train',
        description: 'Découvrez le zoo à bord de notre train panoramique',
        horaire: '09:00:00',
        employe_id: null
      },
      {
        id: 2,
        nom: 'Visite en Groupe',
        description: 'Visites guidées pour groupes scolaires et associations',
        horaire: '10:00:00',
        employe_id: null
      },
      {
        id: 3,
        nom: 'Restaurant',
        description: 'Savourez nos spécialités culinaires dans un cadre unique',
        horaire: '12:00:00',
        employe_id: null
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('services', null, {});
  }
};
