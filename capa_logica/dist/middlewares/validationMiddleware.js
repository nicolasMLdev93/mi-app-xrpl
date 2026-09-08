"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.walletIdParamValidation = exports.trustLineIdParamValidation = exports.cambiarLimiteValidationRules = exports.actualizarTrustLineValidationRules = exports.trustLineValidationRules = exports.billeteraValidationRules = exports.loginValidationRules = exports.registerValidationRules = void 0;
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
exports.trustLineValidationRules = [
    (0, express_validator_1.body)('wallet_id')
        .notEmpty().withMessage('wallet_id es obligatorio')
        .isInt().withMessage('wallet_id debe ser un número entero'),
    (0, express_validator_1.body)('currency')
        .notEmpty().withMessage('currency es obligatorio')
        .isString().withMessage('currency debe ser texto')
        .isLength({ max: 10 }).withMessage('currency no puede exceder 10 caracteres'),
    (0, express_validator_1.body)('issuer')
        .notEmpty().withMessage('issuer es obligatorio')
        .isString().withMessage('issuer debe ser texto')
        .isLength({ max: 255 }).withMessage('issuer no puede exceder 255 caracteres'),
    (0, express_validator_1.body)('limit_amount')
        .optional()
        .isNumeric().withMessage('limit_amount debe ser un número')
        .custom((value) => value > 0).withMessage('limit_amount debe ser mayor a 0'),
];
exports.actualizarTrustLineValidationRules = [
    (0, express_validator_1.body)('limit_amount')
        .optional()
        .isNumeric().withMessage('limit_amount debe ser un número')
        .custom((value) => value > 0).withMessage('limit_amount debe ser mayor a 0'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'inactive', 'blocked']).withMessage('status debe ser active, inactive o blocked'),
    (0, express_validator_1.body)('balance')
        .optional()
        .isNumeric().withMessage('balance debe ser un número')
        .custom((value) => value >= 0).withMessage('balance no puede ser negativo'),
];
exports.cambiarLimiteValidationRules = [
    (0, express_validator_1.body)('new_limit')
        .notEmpty().withMessage('new_limit es obligatorio')
        .isNumeric().withMessage('new_limit debe ser un número')
        .custom((value) => value > 0).withMessage('new_limit debe ser mayor a 0'),
];
exports.trustLineIdParamValidation = [
    (0, express_validator_1.param)('id')
        .isInt().withMessage('ID de trust line inválido'),
];
exports.walletIdParamValidation = [
    (0, express_validator_1.param)('wallet_id')
        .isInt().withMessage('ID de wallet inválido'),
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
