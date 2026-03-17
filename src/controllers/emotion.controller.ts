import { Request, Response, NextFunction } from "express";
import { getEmotionParamsInput, createEmotionInput } from "../schemas/emotion.schema.js";
import { getAllEmotionsService, getEmotionService, createEmotionService } from "../services/emotion.service.js";


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
    req: Request<getEmotionParamsInput, {}, {}>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const emotion = await getEmotionService(id);

        return res.status(200).json({ data: emotion })

    } catch (error) {
        if (error instanceof Error && error.message === "EMOTION_NOT_FOUND") {
            return res.status(404).json({ message: "Aucune émotion n'a été trouvée" })
        }

        next(error)
    }
}

export const createEmotionController = async (
    req: Request<{}, {}, createEmotionInput>,
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
                return res.status(409).json({ message: "Cette émotion existe déjà" })
            }

            if (error.message === "LEVEL_1_CANNOT_HAVE_PARENT") {
                return res.status(400).json({ message: "Une émotion de niveau 1 ne peut pas avoir de parent" })
            }

            if (error.message === "LEVEL_2_REQUIRES_PARENT") {
                return res.status(400).json({ message: "Une émotion de niveau 2 doit avoir un parent" })
            }

            if (error.message === "PARENT_EMOTION_NOT_FOUND") {
                return res.status(404).json({ message: "L'émotion parent n'existe pas" })
            }
            next(error);
        }
    }
}