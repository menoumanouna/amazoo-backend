"use strict";
const passwordHash = require('password-hash');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Créer l'utilisateur admin
    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        firstName: 'Admin',
        lastName: 'Amazoo',
        email: 'admin@amazoo.com',
        password: passwordHash.generate('Admin123!'),
        pseudo: 'admin_amazoo',
        status: 'accepted',
        verificationCode: 'VERIFIED',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Assigner le rôle admin
    await queryInterface.bulkInsert('roleUsers', [
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        roleId: '550e8400-e29b-41d4-a716-446655440001',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roleUsers', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
