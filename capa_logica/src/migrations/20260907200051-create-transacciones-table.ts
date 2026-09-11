import { QueryInterface, DataTypes, literal } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('transacciones', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'billeteras',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tx_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    transaction_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    direction: {
      type: DataTypes.ENUM('incoming', 'outgoing'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    issuer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    source_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    destination: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    error_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ledger_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
  });

  await queryInterface.addIndex('transacciones', ['wallet_id']);
  await queryInterface.addIndex('transacciones', ['tx_hash']);
  await queryInterface.addIndex('transacciones', ['status']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('transacciones');
}