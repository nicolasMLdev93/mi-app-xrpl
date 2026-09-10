import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// ====================
//  REGISTRO
// ====================
export const registerValidationRules = [
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio")
    .isLength({ min: 11 })
    .withMessage(
      "El nombre debe tener al menos 11 caracteres (7 letras + 4 números)",
    )
    .matches(/^(?=.*[A-Za-z]{7,})(?=.*\d{4,})[A-Za-z\d]+$/)
    .withMessage(
      "El nombre debe contener al menos 7 letras seguidas y 4 números seguidos",
    )
    .trim()
    .escape(),

  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("La contraseña debe contener al menos una letra y un número")
    .trim(),
];

// ====================
//  LOGIN
// ====================
export const loginValidationRules = [
  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .trim(),
];

// ====================
//  REGLAS PARA CREAR BILLETERA
// ====================
export const billeteraValidationRules = [
  body("address")
    .notEmpty()
    .withMessage("La dirección es obligatoria")
    .isLength({ min: 10 })
    .withMessage("La dirección debe tener al menos 10 caracteres")
    .trim()
    .escape(),

  body("network")
    .notEmpty()
    .withMessage("La red es obligatoria")
    .isIn(["XRP", "BTC", "ETH", "USDT", "BSC", "SOL"])
    .withMessage("Red no soportada")
    .trim(),

  body("name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("El nombre no puede exceder 100 caracteres")
    .trim(),

  body("provider")
    .optional()
    .isLength({ max: 50 })
    .withMessage("El proveedor no puede exceder 50 caracteres")
    .trim(),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active debe ser booleano"),
];

// ====================
//  VALIDACIONES PARA TRUST LINES
// ====================
export const trustLineValidationRules = [
  body("wallet_id")
    .notEmpty()
    .withMessage("wallet_id es obligatorio")
    .isInt()
    .withMessage("wallet_id debe ser un número entero"),

  body("currency")
    .notEmpty()
    .withMessage("currency es obligatorio")
    .isString()
    .withMessage("currency debe ser texto")
    .isLength({ max: 40 })
    .withMessage("currency no puede exceder 40 caracteres"),

  body("issuer")
    .notEmpty()
    .withMessage("issuer es obligatorio")
    .isString()
    .withMessage("issuer debe ser texto")
    .isLength({ max: 255 })
    .withMessage("issuer no puede exceder 255 caracteres"),

  body("limit_amount")
    .optional()
    .isNumeric()
    .withMessage("limit_amount debe ser un número")
    .custom((value) => value > 0)
    .withMessage("limit_amount debe ser mayor a 0"),
];

export const actualizarTrustLineValidationRules = [
  body("limit_amount")
    .optional()
    .isNumeric()
    .withMessage("limit_amount debe ser un número")
    .custom((value) => value > 0)
    .withMessage("limit_amount debe ser mayor a 0"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "blocked"])
    .withMessage("status debe ser active, inactive o blocked"),

  body("balance")
    .optional()
    .isNumeric()
    .withMessage("balance debe ser un número")
    .custom((value) => value >= 0)
    .withMessage("balance no puede ser negativo"),
];

export const cambiarLimiteValidationRules = [
  body("new_limit")
    .notEmpty()
    .withMessage("new_limit es obligatorio")
    .isNumeric()
    .withMessage("new_limit debe ser un número")
    .custom((value) => value > 0)
    .withMessage("new_limit debe ser mayor a 0"),
];

export const trustLineIdParamValidation = [
  param("id").isInt().withMessage("ID de trust line inválido"),
];

export const walletIdParamValidation = [
  param("wallet_id").isInt().withMessage("ID de wallet inválido"),
];

// ====================
//  VALIDATOR GENERAL
// ====================
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }
  next();
};
