import { prisma } from "../prismaClient.js";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt.js";
import { UserRoleEnum } from "../utils/enum.js";

export interface AuthRequest extends Request {
    user?: {
        idUser: number;
        role: UserRoleEnum;
    };
}

export const authMiddleware = async (
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

         const user = await prisma.user.findUnique({
            where: { idUser: payload.idUser },
            select: {
                idUser: true,
                role: true,
                isActive: true,
                deletedAt: true
            }
        });

         if (!user || !user.isActive || user.deletedAt) {
            return res.status(403).json({
                message: "Compte désactivé"
            });
        }

        req.user = {
            idUser: payload.idUser,
            role: payload.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};