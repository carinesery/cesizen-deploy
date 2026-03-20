import { Request, Response, NextFunction } from "express"
import { getMoodEntryParamsInput, createMoodEntryInput, updateMoodEntryParamsInput, updateMoodEntryBodyInput } from "../schemas/moodEntry.schema.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { createMoodEntryService, getAllMoodEntriesService, getMoodEntryService, updateMoodEntryService } from "../services/moodEntry.service.js";


export const getAllMoodEntriesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const idUser = req.user!.idUser;

        // if (!idUser) {
        //     return res.status(401).json({ message: "Utilisateur non authentifié" })
        // }; Inutile c'est ça ? 

        const moodEntries = await getAllMoodEntriesService(idUser);

        return res.status(200).json({ data: moodEntries }); // peut retourner un tableau vide

    } catch (error) {
        next(error)
    }
}

export const getMoodEntryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const idUser = req.user!.idUser;

        const { id } = req.params as getMoodEntryParamsInput;

        const moodEntry = await getMoodEntryService(idUser, id);

        return res.status(200).json({ data: moodEntry });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "MOOD_ENTRY_NOT_FOUND") {
                return res.status(404).json({
                    message: "Aucun enregistrement trouvé"
                })
            }
        }

        next(error)
    }
}

export const createMoodEntryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const data = req.body as createMoodEntryInput;
        const idUser = req.user!.idUser;

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


export const updateMoodEntryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const { id } = req.params as updateMoodEntryParamsInput;
        const data = req.body as updateMoodEntryBodyInput;
        const idUser = req.user!.idUser;

        const updatedMoodEntry = await updateMoodEntryService(id, data, idUser);

        return res.status(200).json({ data: updatedMoodEntry });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "MOOD_ENTRY_NOT_Found") {
                return res.status(404).json({
                    message: "Aucun enregistrement trouvé"
                });
            }
            if (error.message === "PRINCIPAL_EMOTION_DOES_NOT_EXIST") {
                return res.status(400).json({ message: "Émotion principale introuvable ou supprimée" });

            }
            if (error.message === "FEELING_NOT_FOUND") {
                return res.status(400).json({ message: "Feeling introuvable ou supprimé" });

            }
            if (error.message === "FEELING_NOT_COMPATIBLE") {
                return res.status(400).json({ message: "Le feeling n’est pas compatible avec l’émotion" });

            }
            if (error.message === "EMOTION_DATE_CONFLICT") {
                return res.status(409).json({ message: "Une entrée existe déjà pour cette date" });

            }
        }

        next(error);
    }
}