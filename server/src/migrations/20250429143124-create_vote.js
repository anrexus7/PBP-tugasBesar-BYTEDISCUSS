'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('votes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // Assumes the users table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'userId',
      },
      questionId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'questions', // Assumes the questions table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'questionId',
      },
      answerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'answers', // Assumes the answers table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'answerId',
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          isIn: [[-1, 1]], // -1 for downvote, 1 for upvote
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('votes');
  },
};