'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('questions', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('answers', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('comments', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('votes', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('tags', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('question_tags', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'deletedAt');
    await queryInterface.removeColumn('questions', 'deletedAt');
    await queryInterface.removeColumn('answers', 'deletedAt');
    await queryInterface.removeColumn('comments', 'deletedAt');
    await queryInterface.removeColumn('votes', 'deletedAt');
    await queryInterface.removeColumn('tags', 'deletedAt');
    await queryInterface.removeColumn('question_tags', 'deletedAt');
  }
};
