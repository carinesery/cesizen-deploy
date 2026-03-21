import { Request, Response, NextFunction } from "express";
import { GetEmotionParamsInput, CreateEmotionInput, UpdateEmotionParamsInput, UpdateEmotionBodyInput, DeleteEmotionParamsInput } from "../schemas/emotion.schema.js";
import { getAllEmotionsService, getEmotionService, createEmotionService, updateEmotionService, deleteEmotionService } from "../services/emotion.service.js";


export const getAllEmotionsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const emotions = await getAllEmotionsService();

        return res.status(200).json({ data: emotions })

    } catch (error) {
        if (error instanceof Error && error.message === "LIST_OF_EMOTIONS_DOES_NOT_EXIST") {
            return res.status(404).json({ message: "Pas de liste d'émotions disponible" })
        }
        next(error)
    }
}

export const getEmotionController = async (
    req: Request<GetEmotionParamsInput, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const emotion = await getEmotionService(id);

        return res.status(200).json({ data: emotion })

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EMOTION_NOT_FOUND") {
                return res.status(404).json({
                    // error: "EMOTION_NOT_FOUND",
                    message: "Aucune émotion n'a été trouvée"
                })
            }
            if (error.message === "DATA_INCONSISTENCY_PARENT_DELETED") {
                return res.status(404).json({
                    // error: "DATA_INCONSISTENCY_PARENT_DELETED",
                    message: "Une incohérence des données a été détectée"
                })
            }
        }
        next(error)
    }
}

export const createEmotionController = async (
    req: Request<{}, {}, CreateEmotionInput>,
    res: Response,
    next: NextFunction
) => {
    try {

        const data = req.body;

        const emotionStored = await createEmotionService(data);

        return res.status(201).json({
            data: emotionStored,
            message: "Nouvelle émotion enregistrée avec succès"
        })

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EMOTION_ALREADY_EXISTS") {
                return res.status(409).json({ 
                    // error: "EMOTION_ALREADY_EXISTS",
                    message: "Cette émotion existe déjà" })
            }

            if (error.message === "LEVEL_1_CANNOT_HAVE_PARENT") {
                return res.status(400).json({ 
                    // error: "LEVEL_1_CANNOT_HAVE_PARENT",
                    message: "Une émotion de niveau 1 ne peut pas avoir de parent" })
            }

            if (error.message === "LEVEL_2_REQUIRES_PARENT") {
                return res.status(400).json({ 
                    // error: "LEVEL_2_REQUIRES_PARENT",
                    message: "Une émotion de niveau 2 doit avoir un parent" })
            }

            if (error.message === "PARENT_EMOTION_NOT_FOUND") {
                return res.status(404).json({ 
                    // error: "PARENT_EMOTION_NOT_FOUND",
                    message: "L'émotion parent n'existe pas" })
            }
        }
        next(error);
    }
}

export const updateEmotionController = async (
    req: Request<UpdateEmotionParamsInput, {}, UpdateEmotionBodyInput>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const data = req.body;

        const emotionUpdated = await updateEmotionService(id, data);

        return res.status(200).json({
            data: emotionUpdated,
            message: "Emotion mise à jour avec succès"
        })

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EMOTION_NOT_FOUND") {
                return res.status(404).json({
                    // error: "EMOTION_NOT_FOUND",
                    message: "Aucune émotion trouvée"
                });
            }
            if (error.message === "LEVEL_1_CANNOT_HAVE_PARENT") {
                return res.status(400).json({
                    // error: "LEVEL_1_CANNOT_HAVE_PARENT",
                    message: "Une émotion de niveau 1 ne peut pas avoir de parent"
                });
            }
            if (error.message === "LEVEL_2_REQUIRES_PARENT") {
                return res.status(400).json({
                    // error: "LEVEL_2_REQUIRES_PARENT",
                    message: "Une émotion de niveau 2 doit avoir un parent"
                });
            }
            if (error.message === "CANNOT_DOWNGRADE_WITH_CHILDREN") {
                return res.status(400).json({
                    // error: "CANNOT_DOWNGRADE_WITH_CHILDREN",
                    message: "Impossible de modifier cette émotion car elle possède des sous-émotions"
                });
            }
            if (error.message === "PARENT_EMOTION_NOT_FOUND") {
                return res.status(404).json({
                    // error: "PARENT_EMOTION_NOT_FOUND",
                    message: "L'émotion parent n'existe pas"
                });
            }
            if (error.message === "INVALID_PARENT_LEVEL") {
                return res.status(400).json({
                    // error: "INVALID_PARENT_LEVEL",
                    message: "Le parent doit être une émotion de niveau 1"
                });
            }
            if (error.message === "EMOTION_CANNOT_BE_ITS_OWN_PARENT") {
                return res.status(400).json({
                    // error: "EMOTION_CANNOT_BE_ITS_OWN_PARENT",
                    message: "Le parent de l'émotion ne peut pas être l'émotion elle-même"
                })
            }
        }
        next(error);
    }
}

export const deleteEmotionController = async (
    req: Request<DeleteEmotionParamsInput, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        await deleteEmotionService(id);

        return res.status(200).json({ message: "L'émotion a été supprimée avec succès" });
        
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "EMOTION_NOT_FOUND") {
                return res.status(404).json({
                    // error: "EMOTION_NOT_FOUND",
                    message: "Aucune émotion trouvée"
                });
            }
            if (error.message === "CANNOT_DELETE_WITH_CHILDREN") {
                return res.status(400).json({
                    // error: "CANNOT_DELETE_WITH_CHILDREN",
                    message: "Impossible de supprimer une émotion avec des sous-émotions"
                });
            }
        }

        next(error)
    }
}