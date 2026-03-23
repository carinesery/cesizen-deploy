import { Request, Response, NextFunction } from "express";
import { ValidatedRequest } from "../middlewares/validate.middleware.js";
import { createUserService, confirmEmailService, acceptLegalService, loginUserService, refreshTokenService, logoutService, forgotPasswordService, resetPasswordService } from "../services/user.service.js";
import { forgotPasswordBodyInput, resetPasswordBodyInput, loginUserSchema, registerUserSchema } from "../schemas/user.schema.js";
import { UserRoleEnum } from "../utils/enum.js";
import fs from "fs";
import path from "path";

export const registerController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let newFilePath: string | null = null;
    let profilPictureUrl: string | undefined;

    try {
        const { confirmPassword, ...registerData } = registerUserSchema.parse(req.body);

        const data = {
            ...registerData,
            role: UserRoleEnum.USER
        }

        if (req.file) {
            newFilePath = path.join(process.cwd(), "uploads", req.file.filename);
            profilPictureUrl = `/uploads/${req.file.filename}`;
        }

        const { user } = await createUserService(data, profilPictureUrl);

        return res.status(201).json({
            user: {
                username: user.username,
                email: user.email,
            },
            message: "Utilisateur créé avec succès ! Veuillez confirmer votre adresse email pour activer votre compte.",
        });
    } catch (error) {
        if (newFilePath && fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath);
        }
        if (error instanceof Error &&
            error.message === "USER_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Cet email existe déjà",
            });
        }
        if (error instanceof Error &&
            error.message === "USERNAME_ALREADY_IN_USE") {
            return res.status(409).json({
                message: "Ce nom d'utilisateur est déjà utilisé",
            });
        }
        next(error);
    }
}

export const confirmationEmailController = async (
    req: ValidatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token } = req.validatedQuery!;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Token manquant" });
        }

        const result = await confirmEmailService(token);

        if (result.status === "NEEDS_LEGAL") {
            return res.status(200).json({
                message: "Email confirmé. L'utilisateur doit accepter les conditions pour activer son compte.",
                needsTermsConsent: true,
                legalToken: result.legalToken
            });
        }

        return res.status(200).json({
            message: "Adresse email confirmée avec succès. Compte activé.",
            needsTermsConsent: false
        });


    } catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_TOKEN_TYPE") {
            return res.status(400).json({
                message: "Lien invalide ou expiré",
            });
        }
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "Utilisateur introuvable",
            });
        }
        next(error);
    }
}

export const acceptLegalController = async (
    req: Request,
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
            return res.status(401).json({ message: "Format d'autorisation invalide" });
        }

        // ⚡ vérification des cases cochées
        const { termsConsent, privacyConsent } = req.body;
        if (!termsConsent || !privacyConsent) {
            return res.status(400).json({ message: "Pour activer votre compte, vous devez accepter les conditions et la politique de confidentialité" });
        }

        await acceptLegalService(token);

        return res.status(200).json({
            message: "Conditions acceptées. Compte activé",
        });
    } catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_TOKEN_TYPE") {
            return res.status(400).json({
                message: "Lien invalide ou expiré",
            });
        }
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

        return res.status(200).json({
            accessToken,
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
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
            if (error.message === "ACCOUNT_DISABLED") {
                return res.status(403).json({
                    message: "Votre compte est désactivé"
                });
            }

            if (error.message === "NO_REFRESH_TOKEN" || error.message === "INVALID_REFRESH_TOKEN") {
                return res.status(401).json({
                    message: "Session expirée, veuillez vous reconnecter",
                });
            }
        }
        next(error);
    }
}

export const logoutController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const refreshTokenFromClient = req.cookies?.refreshToken;

        if (!refreshTokenFromClient) {
            return res.status(401).json({ message: "Refresh token manquant ou invalide" })
        }

        await logoutService(refreshTokenFromClient);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // cookie sécurisé en prod
            sameSite: "strict",
        });

        return res.status(200).json({ message: "Déconnexion réussie" })

    } catch (error) {
        res.clearCookie("refreshToken");

        if (error instanceof Error) {
            if (error.message === "INVALID_TOKEN_TYPE" || error.message === "INVALID_REFRESH_TOKEN") {
                return res.status(401).json({
                    message: "Session expirée, veuillez vous reconnecter",
                });
            }
            next(error);
        }

    }
}

export const forgotPasswordController = async (
    req: Request<{}, {}, forgotPasswordBodyInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;

        await forgotPasswordService(email);

        return res.status(200).json({
            message: "Si un compte existe, un email a été envoyé"
        });
    } catch (error) {
        next(error);
    }
};

export const resetPasswordController = async (
    req: Request<{}, {}, resetPasswordBodyInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token, password } = req.body;

        await resetPasswordService(token, password);

        return res.status(200).json({
            message: "Mot de passe réinitialisé avec succès"
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_TOKEN" || error.message === "INVALID_TOKEN_TYPE") {
                return res.status(400).json({
                    message: "Lien invalide ou expiré"
                });
            }
        }
        next(error);
    }
};