"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
const config_1 = require("../config");
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await Usuario_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'El email ya está registrado',
            });
            return;
        }
        const saltRounds = 10;
        const password_hash = await bcrypt_1.default.hash(password, saltRounds);
        const newUser = await Usuario_1.default.create({
            username,
            email,
            password_hash,
        });
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                createdAt: newUser.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Usuario_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
            });
            return;
        }
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };
        if (!config_1.config.jwtSecret) {
            throw new Error('JWT_SECRET no está configurado');
        }
        const jwtSecret = config_1.config.jwtSecret;
        const expiresIn = config_1.config.jwtExpiresIn;
        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, {
            expiresIn,
        });
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};
exports.login = login;
