"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const billeteraController_1 = require("../controllers/billeteraController");
const router = (0, express_1.Router)();
router.post("/register", validationMiddleware_1.registerValidationRules, validationMiddleware_1.validate, authController_1.register);
router.post("/login", validationMiddleware_1.loginValidationRules, validationMiddleware_1.validate, authController_1.login);
router.post("/billeteras", authMiddleware_1.authenticate, validationMiddleware_1.billeteraValidationRules, validationMiddleware_1.validate, billeteraController_1.crearBilletera);
router.get("/billeteras", authMiddleware_1.authenticate, billeteraController_1.obtenerBilleteras);
router.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});
exports.default = router;
