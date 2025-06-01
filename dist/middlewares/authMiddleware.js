"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const redisClient_1 = require("../utils/redisClient");
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Try to get user from cache
        const cachedUser = await redisClient_1.redisClient.get(`user:${decoded.userId}`);
        if (cachedUser) {
            req.userId = decoded.userId;
            return next();
        }
        // If not in cache, check database
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
exports.authMiddleware = authMiddleware;
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { redisClient } from '../utils/redisClient';
// const JWT_SECRET = process.env.JWT_SECRET as string;
// export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) {
//       return res.status(401).json({ message: 'No token, authorization denied' });
//     }
//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
//     // Check cache first
//     const cachedUser = await redisClient.get(`user:${decoded.userId}`);
//     if (cachedUser) {
//       (req as any).userId = decoded.userId;
//       return next();
//     }
//     // If not in cache, check database
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({ message: 'Token is not valid' });
//     }
//     (req as any).userId = decoded.userId;
//     next();
//   } catch (error) {
//     console.error(error);
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };
