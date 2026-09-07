import { DataTypes, Model, Optional, Options, Sequelize } from 'sequelize';
import config from '../config/config.json';

const sequelize = new Sequelize(config.development as Options);

// Atributos de la tabla
interface UsuarioAttributes {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Atributos opcionales al crear
interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password_hash!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
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
    tableName: 'usuarios',
    timestamps: true,
  }
);

export default Usuario;