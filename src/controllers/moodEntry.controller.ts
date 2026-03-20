import { Request, Response, NextFunction } from "express"
import { createMoodEntryInput } from "../schemas/moodEntry.schema.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { createMoodEntryService } from "../services/moodEntry.service.js";

export const createMoodEntryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const data = req.body as createMoodEntryInput;
        const idUser = req.user!.idUser;

        if(!idUser){
            return res.status(401).json({ message: "Utilisateur non authentifié" })
        };

        const moodEntry = await createMoodEntryService(data, idUser);

        return res.status(201).json({
            moodEntry,
            message: "Entrée du journal créée avec succès"
        });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message = "USER_NOT_FOUND") {
                return res.status(404).json({
                    message: "Aucun utilisateur trouvé"
                })
            };
            if (error.message === "MOOD_ENTRY_ALREADY_EXISTS") {
                return res.status(409).json({
                    message: "Une entrée existe déjà pour cette date"
                });
            }
        }
        next(error)
    };
}