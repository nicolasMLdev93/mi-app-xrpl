"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearBilletera = exports.obtenerBilleteras = void 0;
const models_1 = require("../models");
const obtenerBilleteras = async (req, res) => {
    try {
        const userId = req.user?.id;
        console.log("🔍 userId obtenido:", userId);
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        console.log("📦 Consultando billeteras con Trust Lines...");
        const billeteras = await models_1.Billetera.findAll({
            where: { user_id: userId, is_active: true },
            include: [{
                    model: models_1.TrustLine,
                    as: 'trustLines',
                    required: false,
                }],
            order: [["createdAt", "DESC"]],
        });
        console.log(`✅ ${billeteras.length} billeteras encontradas`);
        billeteras.forEach((b, index) => {
            const trustLines = b.trustLines || [];
            console.log(`Billetera ${index + 1}: ID ${b.id}, trustLines: ${trustLines.length}`);
            trustLines.forEach((tl) => {
                console.log(`   - TrustLine: ${tl.currency} (${tl.status}) Límite: ${tl.limit_amount}`);
            });
        });
        res.status(200).json({ success: true, data: billeteras });
    }
    catch (error) {
        console.error("❌ Error al obtener billeteras:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido",
        });
    }
};
exports.obtenerBilleteras = obtenerBilleteras;
const crearBilletera = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Usuario no autenticado" });
            return;
        }
        const { address, network, name, provider, is_active } = req.body;
        const existing = await models_1.Billetera.findOne({ where: { address } });
        if (existing) {
            res.status(409).json({
                success: false,
                message: "Ya existe una billetera con esa dirección",
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
        console.log(`✅ Billetera creada: ID ${nuevaBilletera.id}, address ${nuevaBilletera.address}`);
        res.status(201).json({
            success: true,
            message: "Billetera creada exitosamente",
            data: nuevaBilletera,
        });
    }
    catch (error) {
        console.error("❌ Error al crear billetera:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido",
        });
    }
};
exports.crearBilletera = crearBilletera;
