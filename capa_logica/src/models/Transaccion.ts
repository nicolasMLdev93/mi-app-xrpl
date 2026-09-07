import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface TransaccionAttributes {
  id: number;
  wallet_id: number;
  tx_hash: string;
  transaction_type: string;
  direction: 'incoming' | 'outgoing';
  amount: number;
  currency: string;
  issuer?: string | null;
  source_address?: string | null;
  destination?: string | null;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  error_code?: string | null;
  ledger_index?: number | null;
  transaction_date: Date;
  created_at?: Date;
  updatedAt?: Date;
}

interface TransaccionCreationAttributes extends Optional<TransaccionAttributes, 'id' | 'created_at' | 'updatedAt' | 'issuer' | 'source_address' | 'destination' | 'error_code' | 'ledger_index'> {}

class Transaccion extends Model<TransaccionAttributes, TransaccionCreationAttributes> implements TransaccionAttributes {
  public id!: number;
  public wallet_id!: number;
  public tx_hash!: string;
  public transaction_type!: string;
  public direction!: 'incoming' | 'outgoing';
  public amount!: number;
  public currency!: string;
  public issuer!: string | null;
  public source_address!: string | null;
  public destination!: string | null;
  public status!: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  public error_code!: string | null;
  public ledger_index!: number | null;
  public transaction_date!: Date;
  public readonly created_at!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Transaccion {
    return Transaccion.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        wallet_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'billeteras',
            key: 'id',
          },
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'transacciones',
        timestamps: true,
      }
    );
  }
}

export default Transaccion;