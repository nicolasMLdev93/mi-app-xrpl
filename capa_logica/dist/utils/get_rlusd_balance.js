"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRLUSDBalance = void 0;
const xrpl = __importStar(require("xrpl"));
const config_1 = require("../config");
const getRLUSDBalance = async (address) => {
    if (!xrpl.isValidAddress(address)) {
        console.error('❌ Dirección XRPL inválida:', address);
        return 0;
    }
    const client = new xrpl.Client(config_1.XRPL_TESTNET);
    try {
        console.log('⏳ Consultando balance RLUSD...');
        await client.connect();
        console.log('✅ Conectado a XRPL Testnet');
        const response = await client.request({
            command: 'account_lines',
            account: address,
            peer: config_1.RLUSD_ISSUER,
            ledger_index: 'validated',
        });
        const rlusdLine = response.result.lines.find((line) => line.currency === config_1.RLUSD_CURRENCY);
        if (!rlusdLine) {
            console.log('ℹ️ La wallet no tiene Trust Line de RLUSD.');
            return 0;
        }
        const balance = Number(rlusdLine.balance);
        if (!Number.isFinite(balance)) {
            console.error('❌ Balance RLUSD inválido:', rlusdLine.balance);
            return 0;
        }
        console.log('💰 Balance RLUSD:', balance);
        return balance;
    }
    catch (error) {
        console.error('❌ Error consultando RLUSD:', error);
        return 0;
    }
    finally {
        try {
            if (client.isConnected()) {
                await client.disconnect();
                console.log('🔌 Conexión cerrada.');
            }
        }
        catch {
            console.log('⚠️ No se pudo cerrar la conexión.');
        }
    }
};
exports.getRLUSDBalance = getRLUSDBalance;
