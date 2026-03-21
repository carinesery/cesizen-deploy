import { Request, Response, NextFunction } from "express"
import { getMoodEntryParamsInput, createMoodEntryInput, updateMoodEntryParamsInput, updateMoodEntryBodyInput, deleteMoodEntryParamsInput } from "../schemas/moodEntry.schema.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { createMoodEntryService, getAllMoodEntriesService, getMoodEntryService, updateMoodEntryService, deleteMoodEntryService } from "../services/moodEntry.service.js";


export const getAllMoodEntriesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const idUser = req.user!.idUser;

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
                    error: "MOOD_ENTRY_NOT_FOUND",
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
            // Pour afficher dans le front new Date(emotionDate).toLocaleDateString() 
        });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({
                    error: "USER_NOT_FOUND",
                    message: "Aucun utilisateur trouvé"
                })
            };
            if (error.message === "MOOD_ENTRY_ALREADY_EXISTS") {
                return res.status(409).json({
                    error: "MOOD_ENTRY_ALREADY_EXISTS",
                    message: "Une entrée existe déjà pour cette date"
                });
            }
            if (error.message === "INVALID_PRINCIPAL_EMOTION") {
                return res.status(409).json({ 
                    error: "INVALID_PRINCIPAL_EMOTION",
                    message: "Cet item ne peut pas être utilisé comme émotion principale car il s'agit d'un sentiment"
                });
            }
            if (error.message === "INVALID_FEELING") {
                return res.status(409).json({ 
                    error: "INVALID_FEELING",
                    message: "Cet item ne peut pas être utilisé comme sentiment car il s'agit d'une émotion"
                });
            }
            if (error.message === "FEELING_NOT_LINKED_TO_EMOTION") {
                return res.status(400).json({
                    error: "FEELING_NOT_LINKED_TO_EMOTION",
                    message: "Ce sentiment ne peut pas être associé à l'émotion principale choisie"
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
            if (error.message === "MOOD_ENTRY_NOT_FOUND") {
                return res.status(404).json({
                    error: "MOOD_ENTRY_NOT_Found",
                    message: "Aucun enregistrement trouvé"
                });
            }
            if (error.message === "PRINCIPAL_EMOTION_DOES_NOT_EXIST") {
                return res.status(400).json({
                    error: "PRINCIPAL_EMOTION_DOES_NOT_EXIST",
                    message: "Émotion principale introuvable ou supprimée"
                });
            }
            if (error.message === "FEELING_NOT_FOUND") {
                return res.status(400).json({
                    error: "FEELING_NOT_FOUND",
                    message: "Feeling introuvable ou supprimé"
                });
            }
             if (error.message === "INVALID_PRINCIPAL_EMOTION") {
                return res.status(409).json({
                    error: "INVALID_PRINCIPAL_EMOTION",
                    message: "Cet item ne peut pas être utilisé comme émotion principale car il s'agit d'un sentiment"
                });
            }
            if (error.message === "INVALID_FEELING") {
                return res.status(400).json({
                    error: "INVALID_FEELING",
                    message: "Cet item ne peut pas être utilisé comme sentiment car il s'agit d'une émotion"
                });
            }
            if (error.message === "FEELING_NOT_LINKED_TO_EMOTION") {
                return res.status(400).json({
                    error: "FEELING_NOT_LINKED_TO_EMOTION",
                    message: "Ce sentiment ne peut pas être associé à l'émotion principale choisie"
                });
            }
            if (error.message === "EMOTION_DATE_CONFLICT") {
                return res.status(409).json({
                    error: "EMOTION_DATE_CONFLICT",
                    message: "Une entrée existe déjà pour cette date"
                });

            }
        }

        next(error);
    }
}

export const deleteMoodEntryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const { id } = req.params as deleteMoodEntryParamsInput;

        const idUser = req.user!.idUser;

        await deleteMoodEntryService(id, idUser);

        return res.status(200).json({ message: "Enregistrement supprimé avec succès" });

    } catch (error) {
        if (error instanceof Error && error.message === "MOOD_ENTRY_NOT_FOUND") {
            return res.status(404).json({
                error: "MOOD_ENTRY_NOT_FOUND",
                message: "Aucun enregistrement trouvé"
            })
        }

        next(error)
    }
}