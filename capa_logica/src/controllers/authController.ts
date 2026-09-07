import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  Usuario  from '../models/Usuario';
import { config } from '../config';

// ====================
//  REGISTRO
// ====================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
      return;
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await Usuario.create({
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
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// ====================
//  LOGIN
// ====================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
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

    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const jwtSecret = config.jwtSecret;
    const expiresIn = config.jwtExpiresIn as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(payload, jwtSecret, {
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
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};