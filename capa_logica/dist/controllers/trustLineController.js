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
exports.obtenerBalanceRLUSD = exports.verificarTrustLine = exports.prepararCambioLimite = exports.sincronizarTrustLine = exports.eliminarTrustLine = exports.actualizarTrustLine = exports.crearTrustLine = exports.obtenerTrustLines = void 0;
const models_1 = require("../models");
const checkRLUSDTrustline_1 = require("../utils/checkRLUSDTrustline");
const config_1 = require("../config");
const xrpl = __importStar(require("xrpl"));
const getParam = (param) => {
    return Array.isArray(param) ? param[0] : param;
};
const obtenerTrustLines = async (req, res) => {
    try {
        const userId = req.user?.id;
        const wallet_id = parseInt(getParam(req.params.wallet_id), 10);
        const wallet = await models_1.Billetera.findOne({
            where: { id: wallet_id, user_id: userId },
        });
        if (!wallet) {
            res.status(404).json({ success: false, message: 'Billetera no encontrada' });
            return;
        }
        const trustLines = await models_1.TrustLine.findAll({
            where: { wallet_id },
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json({ success: true, count: trustLines.length, data: trustLines });
    }
    catch (error) {
        console.error('Error al obtener trust lines:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
exports.obtenerTrustLines = obtenerTrustLines;
const crearTrustLine = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { wallet_id, currency, issuer, limit_amount } = req.body;
        const wallet = await models_1.Billetera.findOne({
            where: { id: wallet_id, user_id: userId },
        });
        if (!wallet) {
            res.status(404).json({ success: false, message: 'Billetera no encontrada' });
            return;
        }
        const existing = await models_1.TrustLine.findOne({
            where: { wallet_id, currency, issuer },
        });
        if (existing) {
            res.status(409).json({ success: false, message: 'Ya existe un Trust Line para esta moneda y emisor' });
            return;
        }
        const trustLine = await models_1.TrustLine.create({
            wallet_id,
            currency: currency || config_1.RLUSD_CURRENCY,
            issuer: issuer || config_1.RLUSD_ISSUER,
            limit_amount: limit_amount || 1000000,
            balance: 0,
            status: 'active',
        });
        const hasTrustline = await (0, checkRLUSDTrustline_1.checkRLUSDTrustline)(wallet.address);
        if (hasTrustline) {
            await trustLine.update({ status: 'active' });
        }
        res.status(201).json({
            success: true,
            message: 'Trust Line creado exitosamente',
            data: trustLine,
        });
    }
    catch (error) {
        console.error('Error al crear trust line:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
exports.crearTrustLine = crearTrustLine;
const actualizarTrustLine = async (req, res) => {
    try {
        const trustLine = req.trustLine;
        const { limit_amount, status, balance } = req.body;
        await trustLine.update({
            limit_amount: limit_amount !== undefined ? limit_amount : trustLine.limit_amount,
            status: status || trustLine.status,
            balance: balance !== undefined ? balance : trustLine.balance,
        });
        res.status(200).json({
            success: true,
            message: 'Trust Line actualizado exitosamente',
            data: trustLine,
        });
    }
    catch (error) {
        console.error('Error al actualizar trust line:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
exports.actualizarTrustLine = actualizarTrustLine;
const eliminarTrustLine = async (req, res) => {
    try {
        const trustLine = req.trustLine;
        await trustLine.destroy();
        res.status(200).json({ success: true, message: 'Trust Line eliminado exitosamente' });
    }
    catch (error) {
        console.error('Error al eliminar trust line:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
exports.eliminarTrustLine = eliminarTrustLine;
const sincronizarTrustLine = async (req, res) => {
    try {
        const trustLine = req.trustLine;
        const address = trustLine.billetera.address;
        const hasTrustline = await (0, checkRLUSDTrustline_1.checkRLUSDTrustline)(address);
        if (!hasTrustline) {
            await trustLine.update({ status: 'inactive' });
            res.status(200).json({
                success: true,
                message: 'Trust Line no encontrado en blockchain, marcado como inactivo',
                hasTrustline: false,
            });
            return;
        }
        const { getRLUSDBalance } = await Promise.resolve().then(() => __importStar(require('../utils/get_rlusd_balance')));
        const realBalance = await getRLUSDBalance(address);
        await trustLine.update({
            balance: Number(realBalance),
            status: 'active',
        });
        res.status(200).json({
            success: true,
            message: 'Trust Line sincronizado exitosamente',
            data: trustLine,
            realBalance,
        });
    }
    catch (error) {
        console.error('Error al sincronizar trust line:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
exports.sincronizarTrustLine = sincronizarTrustLine;
const prepararCambioLimite = async (req, res) => {
    try {
        const trustLine = req.trustLine;
        const { new_limit } = req.body;
        if (!new_limit || isNaN(Number(new_limit)) || Number(new_limit) <= 0) {
            res.status(400).json({ success: false, message: 'Límite inválido' });
            return;
        }
        const walletAddress = trustLine.billetera.address;
        const client = new xrpl.Client(config_1.XRPL_TESTNET);
        try {
            await client.connect();
            const trustSet = {
                TransactionType: 'TrustSet',
                Account: walletAddress,
                LimitAmount: {
                    currency: trustLine.currency,
                    issuer: trustLine.issuer,
                    value: String(new_limit),
                },
            };
            const prepared = await client.autofill(trustSet);
            res.status(200).json({
                success: true,
                message: 'Transacción preparada para firmar',
                transaction: prepared,
                trustLineId: trustLine.id,
            });
        }
        finally {
            if (client.isConnected())
                await client.disconnect();
        }
    }
    catch (error) {
        console.error('Error al preparar cambio de límite:', error);
        res.status(500).json({ success: false, message: 'Error al preparar transacción' });
    }
};
exports.prepararCambioLimite = prepararCambioLimite;
const verificarTrustLine = async (req, res) => {
    try {
        const address = getParam(req.params.address);
        const hasTrustline = await (0, checkRLUSDTrustline_1.checkRLUSDTrustline)(address);
        res.json({ hasTrustline });
    }
    catch (error) {
        console.error('Error al verificar trust line:', error);
        res.status(500).json({ error: 'Error al verificar trust line' });
    }
};
exports.verificarTrustLine = verificarTrustLine;
const obtenerBalanceRLUSD = async (req, res) => {
    try {
        const address = getParam(req.params.address);
        const { getRLUSDBalance } = await Promise.resolve().then(() => __importStar(require('../utils/get_rlusd_balance')));
        const balance = await getRLUSDBalance(address);
        res.json({ balance });
    }
    catch (error) {
        console.error('Error al obtener balance RLUSD:', error);
        res.status(500).json({ error: 'Error al obtener balance RLUSD' });
    }
};
exports.obtenerBalanceRLUSD = obtenerBalanceRLUSD;
