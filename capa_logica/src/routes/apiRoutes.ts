import { Router } from "express";
import { register, login } from "../controllers/authController";
import {
  crearBilletera,
  obtenerBilleteras,
} from "../controllers/billeteraController";
import {
  obtenerTrustLines,
  crearTrustLine,
  actualizarTrustLine,
  eliminarTrustLine,
  sincronizarTrustLine,
  prepararCambioLimite,
  verificarTrustLine as verificarTrustLineController,
  obtenerBalanceRLUSD,
} from "../controllers/trustLineController";
import {
  registerValidationRules,
  loginValidationRules,
  billeteraValidationRules,
  trustLineValidationRules,
  actualizarTrustLineValidationRules,
  cambiarLimiteValidationRules,
  trustLineIdParamValidation,
  walletIdParamValidation,
  validate,
} from "../middlewares/validationMiddleware";
import { authenticate } from "../middlewares/authMiddleware";
import {
  verificarTrustLine,
  verificarWallet,
} from "../middlewares/trustLineMiddleware";
import { obtenerTransaccionesUsuario } from "../controllers/transaccionController";
import {
  transaccionesValidationRules,
} from "../middlewares/transaccionValidationMiddleware";

const router = Router();

// Autenticación
router.post("/register", registerValidationRules, validate, register);
router.post("/login", loginValidationRules, validate, login);

// Billeteras
router.get("/billeteras", authenticate, obtenerBilleteras);
router.post(
  "/billeteras",
  authenticate,
  billeteraValidationRules,
  validate,
  crearBilletera,
);

// Obtener trust lines de una billetera
router.get(
  "/billeteras/:wallet_id/trustlines",
  authenticate,
  walletIdParamValidation,
  validate,
  verificarWallet,
  obtenerTrustLines,
);

// Crear trust line (manual)
router.post(
  "/trustlines",
  authenticate,
  trustLineValidationRules,
  validate,
  crearTrustLine,
);

// Actualizar trust line (local)
router.put(
  "/trustlines/:id",
  authenticate,
  trustLineIdParamValidation,
  actualizarTrustLineValidationRules,
  validate,
  verificarTrustLine,
  actualizarTrustLine,
);

// Eliminar trust line
router.delete(
  "/trustlines/:id",
  authenticate,
  trustLineIdParamValidation,
  validate,
  verificarTrustLine,
  eliminarTrustLine,
);

// Sincronizar con blockchain
router.post(
  "/trustlines/:id/sync",
  authenticate,
  trustLineIdParamValidation,
  validate,
  verificarTrustLine,
  sincronizarTrustLine,
);

// Preparar transacción para cambiar límite
router.post(
  "/trustlines/:id/prepare-limit-change",
  authenticate,
  trustLineIdParamValidation,
  cambiarLimiteValidationRules,
  validate,
  verificarTrustLine,
  prepararCambioLimite,
);

// Endpoints para frontend (sin lógica de blockchain)
router.get(
  "/trustlines/check/:address",
  authenticate,
  verificarTrustLineController,
);
// Endpoint para obtener balance de rlusd
router.get("/balances/rlusd/:address", authenticate, obtenerBalanceRLUSD);

// Obtener las transacciones de un usuario determinado
router.get(
  "/transacciones",
  authenticate,
  transaccionesValidationRules,
  validate,
  obtenerTransaccionesUsuario,
);

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

export default router;
