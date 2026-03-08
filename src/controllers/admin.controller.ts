import { Request, Response, NextFunction } from "express";
import { createUserService } from "../services/user.service.js";
import { updateUserService, UpdateUser } from "../services/profile.service.js";
import { adminRegisterSchema } from "../schemas/admin.schema.js";
import { getAllUsersService, getUserService } from "../services/admin.service.js";
import { UserRoleEnum } from "../utils/enum.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const getAllUsersController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await getAllUsersService();
        return res.status(200).json(users);

    } catch (error) {
        next(error);
    }
}

export const getUserController = async (
    req: Request<{ idUser: string }>,
    res: Response,
    next: NextFunction
) => {
    try {

        const idUser = parseInt(req.params.idUser, 10);

        if (isNaN(idUser)) {
            return res.status(400).json({ message: "idUser invalide" });
        }

        const user = await getUserService(idUser);

        return res.status(200).json(user);

    } catch (error) {
        if ((error instanceof Error && error.message === "USER_NOT_FOUND")) {
            return res.status(404).json({ message: "Utilisateur introuvable" })
        }

        next(error);
    }

};

export const adminCreateUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const registerData = adminRegisterSchema.parse(req.body);

        const data = {
            ...registerData,
            termsConsent: null,
            privacyConsent: null,
        }

        const { user } = await createUserService(data);


        res.status(201).json({
            userId: user.idUser,
            message: "Utilisateur créé avec succès ! Veuillez confirmer votre adresse email pour activer votre compte."
        })
    } catch (error) {
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

export const updateUserController = async (
    req: Request<{ idUser: string }, any, UpdateUser> & { user?: {idUser: number; role: UserRoleEnum }},
    res: Response,
    next: NextFunction
) => {
    try {

        const idUser = parseInt(req.params.idUser, 10);

        if (isNaN(idUser)) {
            return res.status(400).json({ message: "idUser invalide" });
        }

        // A verif ? 
        const data: UpdateUser = req.body;

        const idAdmin = req.user!.idUser;

        const userProfile = await updateUserService(idUser, data, idAdmin);

        res.status(200).json(userProfile);

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