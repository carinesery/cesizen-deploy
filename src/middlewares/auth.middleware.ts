import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";
import { UserRoleEnum } from "../utils/enum.js";

export interface AuthRequest extends Request {
    user?: {
        idUser: number;
        role: UserRoleEnum;
    };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token manquant" });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Format de token invalide" });
        }
        const payload = verifyJwt<{ idUser: number; role: UserRoleEnum }>(
            token,
            process.env.JWT_SECRET!
        );

        req.user = {
            idUser: payload.idUser,
            role: payload.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};