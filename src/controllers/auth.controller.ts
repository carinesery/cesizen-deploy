import { Request, Response, NextFunction } from "express";
import { createUser, confirmEmail, loginUser } from "../services/user.service.js";
import { loginUserSchema, registerUserSchema } from "../schemas/user.schema.js";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = registerUserSchema.parse(req.body);
        const { user } = await createUser(data);
        res.status(201).json({
            user: {
                username: user.username,
                email: user.email,
            },
            message: "Utilisateur créé avec succès ! Veuillez confirmer votre adresse email pour activer votre compte.",
        });
    } catch (error) {
        if (error instanceof Error &&
            error.message === "USER_ALREADY_EXISTS") {
            return res.status(400).json({
                message: "Cet email existe déjà",
            });
        }
        if (error instanceof Error &&
            error.message === "USERNAME_ALREADY_IN_USE") {
            return res.status(400).json({
                message: "Ce nom d'utilisateur est déjà utilisé",
            });
        }
        if (error instanceof Error &&
            error.message === "TERMS_NOT_ACCEPTED") {
            return res.status(400).json({
                message: "Les CGU doivent être acceptées",
            });
        }
        if (error instanceof Error &&
            error.message === "PRIVACY_NOT_ACCEPTED") {
            return res.status(400).json({
                message: "La politique de confidentialité doit être acceptée",
            });
        }
        next(error);
    }
}

export const confirmationEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Token manquant" });
        }

        await confirmEmail(token);

        res.status(200).json({
            message: "Adresse email confirmée avec succès",
        });
    } catch (error) {
        res.status(400).json({
            message: "Lien invalide ou expiré",
        });
        next(error);
    }
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = loginUserSchema.parse(req.body);
        const { user, token } = await loginUser(data);
        res.status(200).json({
            token,
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
            },
        }); // on ne va pas renvoyer tout le User donc à vérif
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EMAIL_NOT_FOUND" || error.message === "INVALID_PASSWORD" || error.message === "INACTIVE_USER") {
                return res.status(401).json({
                    message: "Email ou mot de passe incorrect",
                }
                );
            }
        }
        next(error);
    }
}