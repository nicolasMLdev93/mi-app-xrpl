import { Sequelize } from 'sequelize';
import config from '../config/config.js'; 
import Usuario from './Usuario';
import Billetera from './Billetera';
import Transaccion from './Transaccion';
import TrustLine from './TrustLine';

// =========================================
// 1. CONFIGURACIÓN DE ENTORNO
// =========================================
const env = process.env.NODE_ENV || 'development';
const dbConfig = (config as any)[env];

if (!dbConfig) {
  throw new Error(`❌ Configuración para entorno "${env}" no encontrada.`);
}

console.log(`🔌 Conectando a base de datos en entorno: ${env}`);

// =========================================
// 2. CREAR INSTANCIA DE SEQUELIZE
// =========================================
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
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
  }
);

// =========================================
// 3. INICIALIZAR MODELOS
// =========================================
Usuario.initModel(sequelize);
Billetera.initModel(sequelize);
Transaccion.initModel(sequelize);
TrustLine.initModel(sequelize);

console.log('✅ Modelos inicializados correctamente.');

// =========================================
// 4. DEFINIR RELACIONES
// =========================================

Usuario.hasMany(Billetera, {
  foreignKey: 'user_id',
  as: 'billeteras',
});
Billetera.belongsTo(Usuario, {
  foreignKey: 'user_id',
  as: 'usuario',
});

Billetera.hasMany(Transaccion, {
  foreignKey: 'wallet_id',
  as: 'transacciones',
});
Transaccion.belongsTo(Billetera, {
  foreignKey: 'wallet_id',
  as: 'billetera',
});

Billetera.hasMany(TrustLine, {
  foreignKey: 'wallet_id',
  as: 'trustLines',
});
TrustLine.belongsTo(Billetera, {
  foreignKey: 'wallet_id',
  as: 'billetera',
});

console.log('✅ Relaciones entre modelos definidas correctamente.');

// =========================================
// 5. EXPORTAR
// =========================================
export {
  sequelize,
  Usuario,
  Billetera,
  Transaccion,
  TrustLine,
};