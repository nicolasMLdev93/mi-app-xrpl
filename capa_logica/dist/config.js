"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RLUSD_CURRENCY = exports.RLUSD_ISSUER = exports.XRPL_TESTNET = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    db: {
        username: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        host: process.env.DB_HOST || '',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
    }
};
exports.XRPL_TESTNET = 'wss://s.altnet.rippletest.net:51233';
exports.RLUSD_ISSUER = 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV';
exports.RLUSD_CURRENCY = 'RLUSD';
