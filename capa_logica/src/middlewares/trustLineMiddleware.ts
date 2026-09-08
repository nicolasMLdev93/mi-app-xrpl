import { Request, Response, NextFunction } from 'express';
import { TrustLine, Billetera } from '../models';

const getParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export const verificarTrustLine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const idParam = getParam(req.params.id);
    const trustLineId = parseInt(idParam, 10);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    if (isNaN(trustLineId)) {
      res.status(400).json({ success: false, message: 'ID de trust line inválido' });
      return;
    }

    const trustLine = await TrustLine.findOne({
      where: { id: trustLineId },
      include: [{
        model: Billetera,
        as: 'billetera',
        where: { user_id: userId },
      }],
    });

    if (!trustLine) {
      res.status(404).json({ success: false, message: 'Trust Line no encontrado o no pertenece al usuario' });
      return;
    }

    (req as any).trustLine = trustLine;
    next();
  } catch (error) {
    console.error('Error al verificar trust line:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const verificarWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const walletIdParam = getParam(req.params.wallet_id);
    const walletId = parseInt(walletIdParam, 10);

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      return;
    }

    if (isNaN(walletId)) {
      res.status(400).json({ success: false, message: 'ID de wallet inválido' });
      return;
    }

    const wallet = await Billetera.findOne({
      where: { id: walletId, user_id: userId },
    });

    if (!wallet) {
      res.status(404).json({ success: false, message: 'Billetera no encontrada o no pertenece al usuario' });
      return;
    }

    (req as any).wallet = wallet;
    next();
  } catch (error) {
    console.error('Error al verificar wallet:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};