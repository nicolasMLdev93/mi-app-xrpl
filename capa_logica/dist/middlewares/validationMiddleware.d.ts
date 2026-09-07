import { Request, Response, NextFunction } from "express";
export declare const registerValidationRules: import("express-validator").ValidationChain[];
export declare const loginValidationRules: import("express-validator").ValidationChain[];
export declare const billeteraValidationRules: import("express-validator").ValidationChain[];
export declare const validate: (req: Request, res: Response, next: NextFunction) => void;
