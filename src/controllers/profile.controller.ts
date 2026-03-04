import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { getProfileService } from "../services/profile.service.js";

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
        if(error instanceof Error && error.message === "USER_NOT_FOUND") {
            res.status(404).json({message:"Aucun utilisateur trouvé"}) // Je ne suis pas sûre que ce soit safe ? Et est ce que c'est le bon statut ? 
        }
        next(error);
    }
}