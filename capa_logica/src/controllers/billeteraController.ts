import { Request, Response } from 'express';
import { Billetera } from '../models'; 

export const crearBilletera = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    const { address, network, name, provider, is_active } = req.body;

    const existingBilletera = await Billetera.findOne({ where: { address } });
    if (existingBilletera) {
      res.status(409).json({
        success: false,
        message: 'Ya existe una billetera con esa dirección',
      });
      return;
    }

    const nuevaBilletera = await Billetera.create({
      user_id: userId,
      address,
      network,
      name: name || null,
      provider: provider || null,
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json({
      success: true,
      message: 'Billetera creada exitosamente',
      data: nuevaBilletera,
    });
  } catch (error) {
    console.error('Error al crear billetera:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};


export const obtenerBilleteras = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    // Buscar todas las billeteras del usuario
    const billeteras = await Billetera.findAll({
      where: { user_id: userId,  is_active: true },
      order: [['createdAt', 'DESC']], // Ordenar por fecha de creación (más reciente primero)
    });

    res.status(200).json({
      success: true,
      count: billeteras.length,
      data: billeteras,
    });
  } catch (error) {
    console.error('Error al obtener billeteras:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};