'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('billeteras', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      network: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'devnet', 
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      has_rlusd_trustline: { 
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Índices para mejorar el rendimiento
    await queryInterface.addIndex('billeteras', ['user_id']);
    await queryInterface.addIndex('billeteras', ['address']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('billeteras');
  }
};