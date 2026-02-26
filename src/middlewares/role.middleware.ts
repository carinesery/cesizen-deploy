import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { UserRoleEnum } from "../utils/enum.js";

export const roleMiddleware = (...allowedRoles: UserRoleEnum[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Accès interdit" });
        }

        next();
    };
};