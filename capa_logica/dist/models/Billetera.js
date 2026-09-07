"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Billetera extends sequelize_1.Model {
    static initModel(sequelize) {
        return Billetera.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            user_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            address: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true },
            network: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
            name: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
            provider: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
            is_active: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
            createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
            updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
        }, {
            sequelize,
            tableName: 'billeteras',
            timestamps: true,
        });
    }
}
exports.default = Billetera;
