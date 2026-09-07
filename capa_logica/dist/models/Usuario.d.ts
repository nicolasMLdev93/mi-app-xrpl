import { Model, Optional, Sequelize } from 'sequelize';
interface UsuarioAttributes {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initModel(sequelize: Sequelize): typeof Usuario;
}
export default Usuario;
