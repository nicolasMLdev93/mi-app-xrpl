import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface TrustLineAttributes {
  id: number;
  wallet_id: number;
  currency: string;
  issuer: string;
  limit_amount: number;
  balance: number;
  status: 'active' | 'inactive' | 'blocked';
  createdAt?: Date;
  updatedAt?: Date;
}

interface TrustLineCreationAttributes extends Optional<TrustLineAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class TrustLine extends Model<TrustLineAttributes, TrustLineCreationAttributes> implements TrustLineAttributes {
  public id!: number;
  public wallet_id!: number;
  public currency!: string;
  public issuer!: string;
  public limit_amount!: number;
  public balance!: number;
  public status!: 'active' | 'inactive' | 'blocked';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof TrustLine {
    return TrustLine.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        wallet_id: { type: DataTypes.INTEGER, allowNull: false },
        currency: { type: DataTypes.STRING(40), allowNull: false },
        issuer: { type: DataTypes.STRING(255), allowNull: false },
        limit_amount: { type: DataTypes.DECIMAL(20, 8), allowNull: false, defaultValue: 0 },
        balance: { type: DataTypes.DECIMAL(20, 8), allowNull: false, defaultValue: 0 },
        status: { type: DataTypes.ENUM('active', 'inactive', 'blocked'), allowNull: false, defaultValue: 'active' },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      {
        sequelize,
        tableName: 'trust_lines',
        timestamps: true,
      }
    );
  }
}

export default TrustLine;