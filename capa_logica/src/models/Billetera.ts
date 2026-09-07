import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface BilleteraAttributes {
  id: number;
  user_id: number;
  address: string;
  network: string;
  name?: string | null;
  provider?: string | null;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BilleteraCreationAttributes extends Optional<BilleteraAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Billetera extends Model<BilleteraAttributes, BilleteraCreationAttributes> implements BilleteraAttributes {
  public id!: number;
  public user_id!: number;
  public address!: string;
  public network!: string;
  public name!: string | null;
  public provider!: string | null;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Billetera {
    return Billetera.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        address: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        network: { type: DataTypes.STRING(50), allowNull: false },
        name: { type: DataTypes.STRING(100), allowNull: true },
        provider: { type: DataTypes.STRING(50), allowNull: true },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      },
      {
        sequelize,
        tableName: 'billeteras',
        timestamps: true,
      }
    );
  }
}

export default Billetera;