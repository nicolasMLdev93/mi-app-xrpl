"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustLine = exports.Transaccion = exports.Billetera = exports.Usuario = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const config_json_1 = __importDefault(require("../config/config.json"));
const Usuario_1 = __importDefault(require("./Usuario"));
exports.Usuario = Usuario_1.default;
const Billetera_1 = __importDefault(require("./Billetera"));
exports.Billetera = Billetera_1.default;
const Transaccion_1 = __importDefault(require("./Transaccion"));
exports.Transaccion = Transaccion_1.default;
const TrustLine_1 = __importDefault(require("./TrustLine"));
exports.TrustLine = TrustLine_1.default;
const env = process.env.NODE_ENV || 'development';
const dbConfig = config_json_1.default[env];
if (!dbConfig) {
    throw new Error(`❌ Configuración para entorno "${env}" no encontrada.`);
}
console.log(`🔌 Conectando a base de datos en entorno: ${env}`);
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port || 3306,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
exports.sequelize = sequelize;
Usuario_1.default.initModel(sequelize);
Billetera_1.default.initModel(sequelize);
Transaccion_1.default.initModel(sequelize);
TrustLine_1.default.initModel(sequelize);
console.log('✅ Modelos inicializados correctamente.');
Usuario_1.default.hasMany(Billetera_1.default, {
    foreignKey: 'user_id',
    as: 'billeteras',
});
Billetera_1.default.belongsTo(Usuario_1.default, {
    foreignKey: 'user_id',
    as: 'usuario',
});
Billetera_1.default.hasMany(Transaccion_1.default, {
    foreignKey: 'wallet_id',
    as: 'transacciones',
});
Transaccion_1.default.belongsTo(Billetera_1.default, {
    foreignKey: 'wallet_id',
    as: 'billetera',
});
Billetera_1.default.hasMany(TrustLine_1.default, {
    foreignKey: 'wallet_id',
    as: 'trustLines',
});
TrustLine_1.default.belongsTo(Billetera_1.default, {
    foreignKey: 'wallet_id',
    as: 'billetera',
});
console.log('✅ Relaciones entre modelos definidas correctamente.');
