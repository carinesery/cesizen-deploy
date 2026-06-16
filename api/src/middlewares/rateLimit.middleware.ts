import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger.js";

// 🌐 Limiteur global : 100 requêtes par 15 minutes
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite de 100 requêtes par windowMs
    message: "Trop de requêtes depuis cette IP, réessayez après 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Ne pas limiter les requêtes GET (lecture)
        return req.method === "GET";
    }
});

// 🔒 Limiteur strict pour l'authentification : 5 requêtes par 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limite stricte
    message: "Trop de tentatives de connexion, réessayez après 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Ne compte que les erreurs (403, 401, etc)

    /* Ajout pour logs de sécurité */
    handler: (req, res) => {

        logger.security(
            "RATE_LIMIT_EXCEEDED",
            `IP=${req.ip} Route=${req.originalUrl}`
        );

        res.status(429).json({
            message: "Trop de tentatives de connexion, réessayez après 15 minutes",
        });
    }
});
