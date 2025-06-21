'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('contacts', 'owner', {
      type: Sequelize.INTEGER,
      allowNull: false, // Assuming owner is mandatory for a contact
      references: {
        model: 'users', // Name of the target table
        key: 'id',   // Key in the target table that we're referencing
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Or 'CASCADE' depending on desired behavior
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('contacts', 'owner');
  }
};
