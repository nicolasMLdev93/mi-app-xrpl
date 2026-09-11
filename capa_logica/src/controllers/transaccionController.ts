import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Transaccion, Billetera } from "../models";

export const obtenerTransaccionesUsuario = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }

    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const { count, rows } = await Transaccion.findAndCountAll({
      include: [
        {
          model: Billetera,
          as: "billetera",
          where: {
            user_id: userId,
          },
          attributes: [],
        },
      ],
      order: [["transaction_date", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + rows.length < count,
      },
    });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);

    res.status(500).json({
      success: false,
      message: "Error al obtener las transacciones",
    });
  }
};
