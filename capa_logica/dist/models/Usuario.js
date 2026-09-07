"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Usuario extends sequelize_1.Model {
    static initModel(sequelize) {
        return Usuario.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            username: { type: sequelize_1.DataTypes.STRING(50), allowNull: false, unique: true },
            email: { type: sequelize_1.DataTypes.STRING(100), allowNull: false, unique: true },
            password_hash: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
            createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
            updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
        }, {
            sequelize,
            tableName: 'usuarios',
            timestamps: true,
        });
    }
}
exports.default = Usuario;
