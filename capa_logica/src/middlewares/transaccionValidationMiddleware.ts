import { query } from "express-validator";

export const transaccionesValidationRules = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El offset debe ser un número mayor o igual a 0"),
];