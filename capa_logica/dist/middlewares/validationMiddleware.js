"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.loginValidationRules = exports.registerValidationRules = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidationRules = [
    (0, express_validator_1.body)('username')
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .trim()
        .escape(),
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una letra y un número')
        .trim(),
];
exports.loginValidationRules = [
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .trim(),
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
