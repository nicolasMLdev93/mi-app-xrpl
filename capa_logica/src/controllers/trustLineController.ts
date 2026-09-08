import { Request, Response } from 'express';
import { TrustLine, Billetera } from '../models';
import { checkRLUSDTrustline } from '../utils/checkRLUSDTrustline';
import { RLUSD_ISSUER, RLUSD_CURRENCY, XRPL_TESTNET } from '../config';
import * as xrpl from 'xrpl';

const getParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

// =========================================
// OBTENER TRUST LINES DE UNA BILLETERA
// =========================================
export const obtenerTrustLines = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const wallet_id = parseInt(getParam(req.params.wallet_id), 10);

    const wallet = await Billetera.findOne({
      where: { id: wallet_id, user_id: userId },
    });
    if (!wallet) {
      res.status(404).json({ success: false, message: 'Billetera no encontrada' });
      return;
    }

    const trustLines = await TrustLine.findAll({
      where: { wallet_id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, count: trustLines.length, data: trustLines });
  } catch (error) {
    console.error('Error al obtener trust lines:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// =========================================
// CREAR TRUST LINE (MANUAL)
// =========================================
export const crearTrustLine = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { wallet_id, currency, issuer, limit_amount } = req.body;

    const wallet = await Billetera.findOne({
      where: { id: wallet_id, user_id: userId },
    });
    if (!wallet) {
      res.status(404).json({ success: false, message: 'Billetera no encontrada' });
      return;
    }

    const existing = await TrustLine.findOne({
      where: { wallet_id, currency, issuer },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'Ya existe un Trust Line para esta moneda y emisor' });
      return;
    }

    const trustLine = await TrustLine.create({
      wallet_id,
      currency: currency || RLUSD_CURRENCY,
      issuer: issuer || RLUSD_ISSUER,
      limit_amount: limit_amount || 1000000,
      balance: 0,
      status: 'active',
    });

    const hasTrustline = await checkRLUSDTrustline(wallet.address);
    if (hasTrustline) {
      await trustLine.update({ status: 'active' });
    }

    res.status(201).json({
      success: true,
      message: 'Trust Line creado exitosamente',
      data: trustLine,
    });
  } catch (error) {
    console.error('Error al crear trust line:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// =========================================
// ACTUALIZAR TRUST LINE (LOCAL)
// =========================================
export const actualizarTrustLine = async (req: Request, res: Response): Promise<void> => {
  try {
    const trustLine = (req as any).trustLine;
    const { limit_amount, status, balance } = req.body;

    await trustLine.update({
      limit_amount: limit_amount !== undefined ? limit_amount : trustLine.limit_amount,
      status: status || trustLine.status,
      balance: balance !== undefined ? balance : trustLine.balance,
    });

    res.status(200).json({
      success: true,
      message: 'Trust Line actualizado exitosamente',
      data: trustLine,
    });
  } catch (error) {
    console.error('Error al actualizar trust line:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// =========================================
// ELIMINAR TRUST LINE
// =========================================
export const eliminarTrustLine = async (req: Request, res: Response): Promise<void> => {
  try {
    const trustLine = (req as any).trustLine;
    await trustLine.destroy();

    res.status(200).json({ success: true, message: 'Trust Line eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar trust line:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// =========================================
// SINCRONIZAR CON BLOCKCHAIN
// =========================================
export const sincronizarTrustLine = async (req: Request, res: Response): Promise<void> => {
  try {
    const trustLine = (req as any).trustLine;
    const address = trustLine.billetera.address;

    const hasTrustline = await checkRLUSDTrustline(address);
    if (!hasTrustline) {
      await trustLine.update({ status: 'inactive' });
      res.status(200).json({
        success: true,
        message: 'Trust Line no encontrado en blockchain, marcado como inactivo',
        hasTrustline: false,
      });
      return;
    }

    const { getRLUSDBalance } = await import('../utils/get_rlusd_balance');
    const realBalance = await getRLUSDBalance(address);

    await trustLine.update({
      balance: Number(realBalance),
      status: 'active',
    });

    res.status(200).json({
      success: true,
      message: 'Trust Line sincronizado exitosamente',
      data: trustLine,
      realBalance,
    });
  } catch (error) {
    console.error('Error al sincronizar trust line:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// =========================================
// PREPARAR TRANSACCIÓN PARA CAMBIAR LÍMITE
// =========================================
export const prepararCambioLimite = async (req: Request, res: Response): Promise<void> => {
  try {
    const trustLine = (req as any).trustLine;
    const { new_limit } = req.body;

    if (!new_limit || isNaN(Number(new_limit)) || Number(new_limit) <= 0) {
      res.status(400).json({ success: false, message: 'Límite inválido' });
      return;
    }

    const walletAddress = trustLine.billetera.address;
    const client = new xrpl.Client(XRPL_TESTNET);
    try {
      await client.connect();

      const trustSet: xrpl.TrustSet = {
        TransactionType: 'TrustSet',
        Account: walletAddress,
        LimitAmount: {
          currency: trustLine.currency,
          issuer: trustLine.issuer,
          value: String(new_limit),
        },
      };

      const prepared = await client.autofill(trustSet);

      res.status(200).json({
        success: true,
        message: 'Transacción preparada para firmar',
        transaction: prepared,
        trustLineId: trustLine.id,
      });
    } finally {
      if (client.isConnected()) await client.disconnect();
    }
  } catch (error) {
    console.error('Error al preparar cambio de límite:', error);
    res.status(500).json({ success: false, message: 'Error al preparar transacción' });
  }
};

// =========================================
// VERIFICAR TRUST LINE (para frontend)
// =========================================
export const verificarTrustLine = async (req: Request, res: Response): Promise<void> => {
  try {
    const address = getParam(req.params.address);
    const hasTrustline = await checkRLUSDTrustline(address);
    res.json({ hasTrustline });
  } catch (error) {
    console.error('Error al verificar trust line:', error);
    res.status(500).json({ error: 'Error al verificar trust line' });
  }
};

// =========================================
// OBTENER BALANCE RLUSD (para frontend)
// =========================================
export const obtenerBalanceRLUSD = async (req: Request, res: Response): Promise<void> => {
  try {
    const address = getParam(req.params.address);
    const { getRLUSDBalance } = await import('../utils/get_rlusd_balance');
    const balance = await getRLUSDBalance(address);
    res.json({ balance });
  } catch (error) {
    console.error('Error al obtener balance RLUSD:', error);
    res.status(500).json({ error: 'Error al obtener balance RLUSD' });
  }
};