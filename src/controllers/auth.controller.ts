import { Request, Response, NextFunction } from "express";
import { createUserService, confirmEmailService, loginUserService, refreshTokenService } from "../services/user.service.js";
import { loginUserSchema, registerUserSchema } from "../schemas/user.schema.js";

export const registerController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = registerUserSchema.parse(req.body);
        const { user } = await createUserService(data);
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

export const confirmationEmailController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Token manquant" });
        }

        await confirmEmailService(token);

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

export const loginController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = loginUserSchema.parse(req.body);
        const { user, accessToken, refreshToken } = await loginUserService(data);
        
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 60,
        });
        
        res.status(200).json({
            accessToken, // A mettre dans le header bearer avec le front
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
            },
        }); // on ne va pas renvoyer tout le User donc à vérif
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
                return res.status(401).json({
                    message: "Email ou mot de passe incorrect",
        });
        }
        next(error);
    }
}

export const refreshTokenController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenFromClient = req.cookies?.refreshToken;

        if (!tokenFromClient) {
            return res.status(401).json({
                message: "Session expirée, veuillez vous reconnecter",
            });
        }

        const { accessToken } = await refreshTokenService(tokenFromClient);

        return res.status(200).json({ accessToken });

    } catch (error) {
        res.clearCookie("refreshToken");

        if (error instanceof Error) {
            if ( error.message === "NO_REFRESH_TOKEN" || error.message === "INVALID_REFRESH_TOKEN") {
                return res.status(401).json({
                    message: "Session expirée, veuillez vous reconnecter",
                });
            }
        } 
        next(error);
    }
}