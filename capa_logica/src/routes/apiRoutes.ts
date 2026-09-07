import { Router } from "express";
import { register, login } from "../controllers/authController";
import {
  registerValidationRules,
  loginValidationRules,
  validate,
  billeteraValidationRules,
} from "../middlewares/validationMiddleware";
import { authenticate } from "../middlewares/authMiddleware";
import {
  crearBilletera,
  obtenerBilleteras,
} from "../controllers/billeteraController";
const router = Router();

router.post("/register", registerValidationRules, validate, register);

router.post("/login", loginValidationRules, validate, login);

// Ruta protegida
router.post(
  "/billeteras",
  authenticate,
  billeteraValidationRules,
  validate,
  crearBilletera,
);

router.get("/billeteras", authenticate, obtenerBilleteras);

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

export default router;
