import { Request, Response, NextFunction } from "express";
import { createUserService } from "../services/user.service.js";
import { updateUserService, UpdateUser } from "../services/profile.service.js";
import { AdminRegisterInput, adminRegisterSchema, UserStatusParamsInput, UserStatusBodyInput, GetUserParamsInput, AdminUpdateUserParamsInput, DeleteUserParamsInput } from "../schemas/admin.schema.js";
import { getAllUsersService, getUserService, setUserActiveStatusService, deleteUserService } from "../services/admin.service.js";
import { UserRoleEnum } from "../utils/enum.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import fs from "fs";
import path from "path";

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
    req: Request<GetUserParamsInput>,
    res: Response,
    next: NextFunction
) => {
    try {

        const idUser = req.params.id;

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
    req: Request<{}, {}, AdminRegisterInput>,
    res: Response,
    next: NextFunction
) => {
    let newFilePath: string | null = null;
    let profilPictureUrl: string | undefined;
    try {

        const { confirmPassword, ...registerData } = req.body;

        const data = {
            ...registerData,
            termsConsent: null,
            privacyConsent: null,
        }

        if (req.file) {
            newFilePath = path.join(process.cwd(), "uploads", req.file.filename);
            profilPictureUrl = `/uploads/${req.file.filename}`;
        }

        const { user } = await createUserService(data, profilPictureUrl);


        res.status(201).json({
            userId: user.idUser,
            message: "Utilisateur créé avec succès ! Veuillez confirmer votre adresse email pour activer votre compte."
        })
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

export const updateUserController = async ( // Changement ici
    req: Request<AdminUpdateUserParamsInput, any, UpdateUser> & { user?: { idUser: string; role: UserRoleEnum } },
    res: Response,
    next: NextFunction
) => {
    let newFilePath: string | null = null;
    let profilPictureUrl: string | null | undefined;

    try {

        const idUser = req.params.id;

        const data: UpdateUser = req.body;

        const idAdmin = req.user!.idUser;
        if (!idAdmin) return res.status(401).json({ message: "Admin non authentifié" });

        // Changement d'image 
        if (req.file) {
            newFilePath = path.join(process.cwd(), "uploads", req.file.filename);
            profilPictureUrl = `/uploads/${req.file.filename}`;
        }
        // Suppression explicite
        else if (req.body.profilPictureUrl === "null") {
            profilPictureUrl = null
        }

        const { user, emailChanged, oldProfilPictureUrl } = await updateUserService(idUser, data, profilPictureUrl, idAdmin);

        if (
            profilPictureUrl !== undefined && // on a demandé un changement
            oldProfilPictureUrl // il y avait une ancienne image
        ) {
            const oldPath = path.join(process.cwd(), oldProfilPictureUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        res.status(200).json({ user, emailChanged });

    } catch (error) {
        if (newFilePath && fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath);
        }
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

export const setUserActiveStatusController = async (
    req: Request<UserStatusParamsInput> & { user?: { idUser: string; role: UserRoleEnum } },
    res: Response,
    next: NextFunction
) => {
    try {
        // const idUser = parseInt(req.params.idUser, 10);
        const idUser = req.params.id;
        // Faut-il faire une vérif qu'on a bien un user ici ?
        const data: UserStatusBodyInput = req.body;

        const idAdmin = req.user!.idUser;
        if (!idAdmin) return res.status(401).json({ message: "Admin non authentifié" });

        await setUserActiveStatusService(idUser, data, idAdmin);


        const action = data.isActive ? "réactivé" : "désactivé";
        return res.status(200).json({ message: `Utilisateur ${action} avec succès` });
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        if (error instanceof Error && error.message === "CANNOT_CHANGE_SELF_STATUS") {
            return res.status(403).json({ message: "Impossible de changer le statut de votre propre compte" })
        }
        next(error);
    }
};

export const deleteUserController = async (
    req: Request<DeleteUserParamsInput> & { user?: { idUser: string; role: UserRoleEnum } },
    res: Response,
    next: NextFunction
) => {
    try {
        // Changement ici : 
        // const idUser = parseInt(req.params.idUser, 10);
        const idUser = req.params.id;
        // Faut-il faire une vérif qu'on a bien un user ici ?
        const idAdmin = req.user!.idUser;

        if (!idAdmin) return res.status(401).json({ message: "Admin non authentifié" });

        await deleteUserService(idUser, idAdmin);

        return res.status(200).json({ message: "Compte anonymisé avec succès" });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({ message: "Utilisateur introuvable" });
            }
            if (error.message === "ADMIN_REQUIRED_TO_DELETE_ACCOUNT") {
                return res.status(401).json({ message: "Admin requis pour cette action" });
            }
            if (error.message === "CANNOT_DELETE_SELF_ACCOUNT") {
                return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
            }
        }
        next(error);
    }
}

