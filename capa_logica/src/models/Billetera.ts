import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import config from "../config/config.json";

const sequelize = new Sequelize(config.development as any);

interface BilleteraAttributes {
  id: number;
  user_id: number;
  address: string;
  network: string;
  name?: string | null;
  provider?: string | null;
  is_active: boolean;
  created_at?: Date;
  updatedAt?: Date;
}

interface BilleteraCreationAttributes extends Optional<
  BilleteraAttributes,
  "id" | "created_at" | "updatedAt"
> {}

class Billetera
  extends Model<BilleteraAttributes, BilleteraCreationAttributes>
  implements BilleteraAttributes
{
  public id!: number;
  public user_id!: number;
  public address!: string;
  public network!: string;
  public name!: string | null;
  public provider!: string | null;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updatedAt!: Date;
}

Billetera.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    network: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: "billeteras",
    timestamps: true,
  },
);

export default Billetera;
