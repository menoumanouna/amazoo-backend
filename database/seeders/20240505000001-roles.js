"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        code: 'ADMIN',
        name: 'Administrateur'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        code: 'EMPLOYE',
        name: 'Employé'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        code: 'VETERINAIRE',
        name: 'Vétérinaire'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
