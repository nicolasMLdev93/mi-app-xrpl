"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Transaccion extends sequelize_1.Model {
    static initModel(sequelize) {
        return Transaccion.init({
            id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            wallet_id: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
            tx_hash: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true },
            transaction_type: { type: sequelize_1.DataTypes.STRING(50), allowNull: false },
            direction: { type: sequelize_1.DataTypes.ENUM('incoming', 'outgoing'), allowNull: false },
            amount: { type: sequelize_1.DataTypes.DECIMAL(20, 8), allowNull: false },
            currency: { type: sequelize_1.DataTypes.STRING(10), allowNull: false },
            issuer: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            source_address: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            destination: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
            status: { type: sequelize_1.DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
            error_code: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
            ledger_index: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
            transaction_date: { type: sequelize_1.DataTypes.DATE, allowNull: false },
            createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
            updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
        }, {
            sequelize,
            tableName: 'transacciones',
            timestamps: true,
        });
    }
}
exports.default = Transaccion;
