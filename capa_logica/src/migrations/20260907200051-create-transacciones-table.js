'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transacciones', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'billeteras',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tx_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      transaction_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      direction: {
        type: Sequelize.ENUM('incoming', 'outgoing'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      issuer: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      source_address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      destination: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      error_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ledger_index: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
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

    await queryInterface.addIndex('transacciones', ['wallet_id']);
    await queryInterface.addIndex('transacciones', ['tx_hash']);
    await queryInterface.addIndex('transacciones', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transacciones');
  }
};