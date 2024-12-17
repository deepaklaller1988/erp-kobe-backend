'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add sample data to a table
    await queryInterface.bulkInsert('users', [
      {
        userId: '1898257d-e7e7-460b-a3e8-9ffbac8c801e',
        type: 'seller',
        name: 'Dinesh seller',
        email: 'dinesh@yopmail.com',
        password: '$2a$10$viGCIzmhBH.8LfLWnm3wW.aV.zmsgh7kcNCuGubNFlYnUvNKCTfAi',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: '68cd8629-a7da-4abd-9d08-258d7b2787e7',
        type: 'shipper',
        name: 'Laller shipper',
        email: 'laller@yopmail.com',
        password: '$2a$10$viGCIzmhBH.8LfLWnm3wW.aV.zmsgh7kcNCuGubNFlYnUvNKCTfAi',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the inserted data
    await queryInterface.bulkDelete('users', null, {});
  }
};
