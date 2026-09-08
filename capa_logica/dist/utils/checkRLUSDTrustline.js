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
exports.checkRLUSDTrustline = void 0;
const xrpl = __importStar(require("xrpl"));
const config_1 = require("../config");
const checkRLUSDTrustline = async (address) => {
    if (!xrpl.isValidAddress(address))
        return false;
    const client = new xrpl.Client(config_1.XRPL_TESTNET);
    try {
        await client.connect();
        const response = await client.request({
            command: 'account_lines',
            account: address,
            peer: config_1.RLUSD_ISSUER,
            ledger_index: 'validated',
        });
        const hasLine = response.result.lines.some((line) => line.currency === config_1.RLUSD_CURRENCY);
        return hasLine;
    }
    catch (error) {
        console.error('Error verificando Trust Line:', error);
        return false;
    }
    finally {
        try {
            if (client.isConnected())
                await client.disconnect();
        }
        catch { }
    }
};
exports.checkRLUSDTrustline = checkRLUSDTrustline;
