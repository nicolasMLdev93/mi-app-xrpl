"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class TrustLine extends sequelize_1.Model {
    static initModel(sequelize) {
        return TrustLine.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            wallet_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            currency: { type: sequelize_1.DataTypes.STRING(10), allowNull: false },
            issuer: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
            limit_amount: { type: sequelize_1.DataTypes.DECIMAL(20, 8), allowNull: false, defaultValue: 0 },
            balance: { type: sequelize_1.DataTypes.DECIMAL(20, 8), allowNull: false, defaultValue: 0 },
            status: { type: sequelize_1.DataTypes.ENUM('active', 'inactive', 'blocked'), allowNull: false, defaultValue: 'active' },
            createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
            updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
        }, {
            sequelize,
            tableName: 'trust_lines',
            timestamps: true,
        });
    }
}
exports.default = TrustLine;
