import { Request, Response } from 'express';
export declare const obtenerTrustLines: (req: Request, res: Response) => Promise<void>;
export declare const crearTrustLine: (req: Request, res: Response) => Promise<void>;
export declare const actualizarTrustLine: (req: Request, res: Response) => Promise<void>;
export declare const eliminarTrustLine: (req: Request, res: Response) => Promise<void>;
export declare const sincronizarTrustLine: (req: Request, res: Response) => Promise<void>;
export declare const prepararCambioLimite: (req: Request, res: Response) => Promise<void>;
export declare const verificarTrustLine: (req: Request, res: Response) => Promise<void>;
export declare const obtenerBalanceRLUSD: (req: Request, res: Response) => Promise<void>;
