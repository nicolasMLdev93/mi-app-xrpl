import { QueryInterface, DataTypes, literal } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('billeteras', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    network: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'devnet',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    has_rlusd_trustline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

  // Índices para mejorar el rendimiento
  await queryInterface.addIndex('billeteras', ['user_id']);
  await queryInterface.addIndex('billeteras', ['address']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('billeteras');
}