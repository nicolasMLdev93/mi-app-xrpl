"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerBilleteras = exports.crearBilletera = void 0;
const models_1 = require("../models");
const crearBilletera = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
            return;
        }
        const { address, network, name, provider, is_active } = req.body;
        const existingBilletera = await models_1.Billetera.findOne({ where: { address } });
        if (existingBilletera) {
            res.status(409).json({
                success: false,
                message: 'Ya existe una billetera con esa dirección',
            });
            return;
        }
        const nuevaBilletera = await models_1.Billetera.create({
            user_id: userId,
            address,
            network,
            name: name || null,
            provider: provider || null,
            is_active: is_active !== undefined ? is_active : true,
        });
        res.status(201).json({
            success: true,
            message: 'Billetera creada exitosamente',
            data: nuevaBilletera,
        });
    }
    catch (error) {
        console.error('Error al crear billetera:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};
exports.crearBilletera = crearBilletera;
const obtenerBilleteras = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
            });
            return;
        }
        const billeteras = await models_1.Billetera.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json({
            success: true,
            count: billeteras.length,
            data: billeteras,
        });
    }
    catch (error) {
        console.error('Error al obtener billeteras:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};
exports.obtenerBilleteras = obtenerBilleteras;
