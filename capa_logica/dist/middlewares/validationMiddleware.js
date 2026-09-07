"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.billeteraValidationRules = exports.loginValidationRules = exports.registerValidationRules = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidationRules = [
    (0, express_validator_1.body)("username")
        .notEmpty()
        .withMessage("El nombre de usuario es obligatorio")
        .isLength({ min: 11 })
        .withMessage("El nombre debe tener al menos 11 caracteres (7 letras + 4 números)")
        .matches(/^(?=.*[A-Za-z]{7,})(?=.*\d{4,})[A-Za-z\d]+$/)
        .withMessage("El nombre debe contener al menos 7 letras seguidas y 4 números seguidos")
        .trim()
        .escape(),
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("El email es obligatorio")
        .isEmail()
        .withMessage("Debe ser un email válido")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("La contraseña es obligatoria")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres")
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage("La contraseña debe contener al menos una letra y un número")
        .trim(),
];
exports.loginValidationRules = [
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("El email es obligatorio")
        .isEmail()
        .withMessage("Debe ser un email válido")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("La contraseña es obligatoria")
        .trim(),
];
exports.billeteraValidationRules = [
    (0, express_validator_1.body)("address")
        .notEmpty()
        .withMessage("La dirección es obligatoria")
        .isLength({ min: 10 })
        .withMessage("La dirección debe tener al menos 10 caracteres")
        .trim()
        .escape(),
    (0, express_validator_1.body)("network")
        .notEmpty()
        .withMessage("La red es obligatoria")
        .isIn(["XRP", "BTC", "ETH", "USDT", "BSC", "SOL"])
        .withMessage("Red no soportada")
        .trim(),
    (0, express_validator_1.body)("name")
        .optional()
        .isLength({ max: 100 })
        .withMessage("El nombre no puede exceder 100 caracteres")
        .trim(),
    (0, express_validator_1.body)("provider")
        .optional()
        .isLength({ max: 50 })
        .withMessage("El proveedor no puede exceder 50 caracteres")
        .trim(),
    (0, express_validator_1.body)("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active debe ser booleano"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: errors.array(),
        });
        return;
    }
    next();
};
exports.validate = validate;
