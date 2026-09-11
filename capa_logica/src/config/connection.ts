import { Sequelize } from 'sequelize';
import config from './config';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

if (!dbConfig) {
  throw new Error(`Configuración para entorno "${env}" no encontrada.`);
}

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: (dbConfig as any).port || 3306, 
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
  }
);

export default sequelize;