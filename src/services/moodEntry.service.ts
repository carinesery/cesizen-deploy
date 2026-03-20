import { prisma } from "../prismaClient.js";
import { createMoodEntryInput } from "../schemas/moodEntry.schema.js"


export const createMoodEntryService = async (data: createMoodEntryInput, idUser: number) => {

    let inputDate = data.emotionDate; // peut être null ou undefined ou être ok ou être invalide 

    // considérer comme vide si : undefined, null, "", NaN, false
    if (!inputDate || Number.isNaN(new Date(inputDate).getTime())) {
        inputDate = new Date(); // aujourd'hui
    } else {
        // transformer en Date
        inputDate = new Date(inputDate);
    }

    // 
    /*  // emotionDate est déjà transformé et validé par Zod
    const inputDate = new Date(data.emotionDate);
    inputDate.setHours(0, 0, 0, 0); // normaliser minuit
 */

    // normaliser pour l'unicité par jour
    inputDate.setHours(0, 0, 0, 0);

    const normalizedDate = new Date(inputDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const existingMoodEntry = await prisma.moodEntry.findUnique({
        where: {
            userId_emotionDate: {
                userId: idUser,
                emotionDate: normalizedDate
            }
        }
    });

    if (existingMoodEntry) {
        throw new Error("MOOD_ENTRY_ALREADY_EXISTS")
    }
    // vérifier que l'émotion existe ?
    // renvoyer une erreur si ce n'est pas le cas
    const emotion = await prisma.emotion.findUnique({
        where: { idEmotion: data.emotionId },
    });

    if (!emotion || emotion.deletedAt) {
        throw new Error("PRINCIPAL_EMOTION_DOES_NOT_EXIST")
    }

    if (data.feelingId) {
        const feeling = await prisma.emotion.findUnique({
            where: { idEmotion: data.feelingId }
        });

        if (!feeling || feeling.deletedAt) {
            throw new Error("FEELING_NOT_FOUND");
        }

        if (!feeling.parentEmotionId) {
            throw new Error("FEELING_HAS_NO_PARENT");
        }

        if (feeling.parentEmotionId !== data.emotionId) {
            throw new Error("FEELING_NOT_LINKED_TO_EMOTION");
        }
    }

    // Créer la moodEntry 
    const { emotionDate, ...rest } = data;

    const moodEntry = await prisma.moodEntry.create({
        data: {
            ...rest,
            userId: idUser,
            emotionDate: normalizedDate
        }
    })

    return moodEntry;
}