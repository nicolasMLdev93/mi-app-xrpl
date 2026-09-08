"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarWallet = exports.verificarTrustLine = void 0;
const models_1 = require("../models");
const getParam = (param) => {
    return Array.isArray(param) ? param[0] : param;
};
const verificarTrustLine = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const idParam = getParam(req.params.id);
        const trustLineId = parseInt(idParam, 10);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Usuario no autenticado' });
            return;
        }
        if (isNaN(trustLineId)) {
            res.status(400).json({ success: false, message: 'ID de trust line inválido' });
            return;
        }
        const trustLine = await models_1.TrustLine.findOne({
            where: { id: trustLineId },
            include: [{
                    model: models_1.Billetera,
                    as: 'billetera',
                    where: { user_id: userId },
                }],
        });
        if (!trustLine) {
            res.status(404).json({ success: false, message: 'Trust Line no encontrado o no pertenece al usuario' });
            return;
        }
        req.trustLine = trustLine;
        next();
    }
    catch (error) {
        console.error('Error al verificar trust line:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
exports.verificarTrustLine = verificarTrustLine;
const verificarWallet = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const walletIdParam = getParam(req.params.wallet_id);
        const walletId = parseInt(walletIdParam, 10);
        if (!userId) {
            res.status(401).json({ success: false, message: 'Usuario no autenticado' });
            return;
        }
        if (isNaN(walletId)) {
            res.status(400).json({ success: false, message: 'ID de wallet inválido' });
            return;
        }
        const wallet = await models_1.Billetera.findOne({
            where: { id: walletId, user_id: userId },
        });
        if (!wallet) {
            res.status(404).json({ success: false, message: 'Billetera no encontrada o no pertenece al usuario' });
            return;
        }
        req.wallet = wallet;
        next();
    }
    catch (error) {
        console.error('Error al verificar wallet:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
exports.verificarWallet = verificarWallet;
