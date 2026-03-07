import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { getProfileService } from "../services/profile.service.js";
import { updateProfileService } from "../services/profile.service.js";
import { UpdatedProfileUserInput } from "../schemas/profile.schema.js";

export const getProfileController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { idUser } = req.user!;

        const user = await getProfileService(idUser);

        res.status(200).json({
            data: {
                username: user.username,
                email: user.email,
                profilPictureUrl: user.profilPictureUrl
            }
        })

    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Aucun utilisateur trouvé" }) // Je ne suis pas sûre que ce soit safe ? Et est ce que c'est le bon statut ? 
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

        const { user, emailChanged } = await updateProfileService(idUser, data);

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
            if (error.message === "USERNAME_ALREADY_USED") {
                return res.status(409).json({ message: "Ce nom d'utilisateur est déjà utilisé" })
            }
            if (error.message === "EMAIL_ALREADY_USED") {
                return res.status(409).json({ message: "Cet email est déjà utilisé" })
            }
            if (error.message === "NO_DATA_TO_UPDATE") {
                return res.status(400).json({ message: "Aucune modification détectée" })
            }
        }
        next(error);
    }
}