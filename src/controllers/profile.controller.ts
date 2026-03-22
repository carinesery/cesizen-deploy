import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { getProfileService } from "../services/profile.service.js";
import { updateUserService, updatePasswordService, deleteAccountService } from "../services/profile.service.js";
import { UpdatedProfileUserInput, UpdatedPasswordInput } from "../schemas/profile.schema.js";

export const getProfileController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { idUser } = req.user!;

        const userProfile = await getProfileService(idUser);

        res.status(200).json({
            data: {
                username: userProfile.username,
                email: userProfile.email,
                profilPictureUrl: userProfile.profilPictureUrl
            }
        })

    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Aucun utilisateur trouvé" })
        }
        if (error instanceof Error && error.message === "ACCOUNT_INACTIVE") {
            return res.status(403).json({ message: "Compte inactif. Aucune lecture possible" })
        }
        next(error);
    }
}

export const updateProfileController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const { idUser } = req.user!;

        const data: UpdatedProfileUserInput = req.body;

        const { user, emailChanged } = await updateUserService(idUser, data);

        return res.status(200).json({
            message: emailChanged
                ? "Profil mis à jour. Un email de confirmation a été envoyé à votre nouvelle adresse."
                : "Votre profil a été mis à jour avec succès.",
            user
        })
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({ message: "Aucun utilisateur trouvé" })
            }
            if (error.message === "ACCOUNT_INACTIVE") {
                return res.status(403).json({ message: "Compte inactif. Aucune modification possible" })
            }
            if (error.message === "USERNAME_ALREADY_USED") {
                return res.status(409).json({ message: "Ce nom d'utilisateur est déjà utilisé" })
            }
            if (error.message === "EMAIL_ALREADY_USED") {
                return res.status(409).json({ message: "Cet email est déjà utilisé" })
            }
            if (error.message === "ADMIN_REQUIRED_TO_CHANGE_ROLE") {
                return res.status(403).json({ message: "Seul un administrateur est autorisé à modifier le rôle" })
            }
            if (error.message === "CANNOT_CHANGE_SELF_ROLE") {
                return res.status(403).json({ message: "Vous ne pouvez pas modifier votre propre role" })
            }
            if (error.message === "NO_DATA_TO_UPDATE") {
                return res.status(400).json({ message: "Aucune modification détectée" })
            }
        }
        next(error);
    }
}

export const updatePasswordController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { idUser } = req.user!;
        const { confirmNewPassword , ...data } = req.body as UpdatedPasswordInput;

        await updatePasswordService(idUser, data);

        return res.status(200).json({
            message: "Mot de passe mis à jour avec succès. Vous devrez vous reconnecter.",
            forceLogout: true
        }); // Le front-end devra supprimer l'accesstoken et rediriger vers la page de connexion.

    } catch (error) {

        if (error instanceof Error) {

            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({
                    message: "Utilisateur introuvable"
                });
            }
            if (error.message === "ACCOUNT_INACTIVE") {
                return res.status(403).json({ message: "Compte inactif. Aucune modification possible" })
            }

            if (error.message === "INVALID_PASSWORD") {
                return res.status(401).json({
                    message: "Mot de passe actuel incorrect"
                });
            }

            if (error.message === "PASSWORD_IDENTICAL") {
                return res.status(400).json({
                    message: "Le nouveau mot de passe doit être différent"
                });
            }
        }

        next(error);
    }
}

export const deleteAccountController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {

    try {
        const idUser = req.user!.idUser;

        await deleteAccountService(idUser);

        return res.status(200).json({ message: "Votre compte a été désactivé. Vous allez être déconnecté dans quelques instants"})

    } catch(error) {
         if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Aucun utilisateur trouvé" })
        }
        if (error instanceof Error && error.message === "ACCOUNT_INACTIVE") {
            return res.status(403).json({ message: "Compte inactif. Aucune action possible" })
        }

        next(error);
    }

}