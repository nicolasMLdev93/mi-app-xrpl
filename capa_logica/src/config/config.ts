import dotenv from "dotenv";
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    host: process.env.DB_HOST as string,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    dialect: "mysql" as const,
    logging: console.log,
  },
  test: {
    username: "test",
    password: "",
    database: ":memory:", // base de datos fantasma para ejecutar los tests en memoria
    host: "localhost",
    dialect: "sqlite" as const,
    storage: ":memory:", 
    logging: false,
  },
  production: {
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    host: process.env.DB_HOST as string,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    dialect: "mysql" as const,
    logging: false,
  },
};

export default config;