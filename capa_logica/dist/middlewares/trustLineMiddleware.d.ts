import { Request, Response, NextFunction } from 'express';
export declare const verificarTrustLine: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verificarWallet: (req: Request, res: Response, next: NextFunction) => Promise<void>;
