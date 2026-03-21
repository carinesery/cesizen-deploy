import { prisma } from "../prismaClient.js";
import { createMoodEntryInput, updateMoodEntryBodyInput } from "../schemas/moodEntry.schema.js"


export const getAllMoodEntriesService = async (idUser: number) => {

    const moodEntries = await prisma.moodEntry.findMany({
        where: {
            userId: idUser,
            deletedAt: null
        },
        include: {
            emotion: true,
            feeling: true,
        }
    })

    return moodEntries;

}

export const getMoodEntryService = async (idUser: number, id: string) => {

    const moodEntry = await prisma.moodEntry.findFirst({
        where: {
            idMoodEntry: id,
            userId: idUser,
            deletedAt: null
        },
        include: {
            emotion: true,
            feeling: true,
        }
    })

    if (!moodEntry) {
        throw new Error("MOOD_ENTRY_NOT_FOUND")
    }

    return moodEntry;
}


export const createMoodEntryService = async (data: createMoodEntryInput, idUser: number) => {

    const baseDate = data.emotionDate ?? new Date();

    const normalizedDate = new Date(Date.UTC(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate()
    ));

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

    const emotion = await prisma.emotion.findUnique({
        where: { idEmotion: data.emotionId },
    });

    if (!emotion || emotion.deletedAt) {
        throw new Error("PRINCIPAL_EMOTION_DOES_NOT_EXIST")
    }

    if (emotion.parentEmotionId) {
        throw new Error("INVALID_PRINCIPAL_EMOTION");
    }

    if (data.feelingId) {
        const feeling = await prisma.emotion.findUnique({
            where: { idEmotion: data.feelingId }
        });

        if (!feeling || feeling.deletedAt) {
            throw new Error("FEELING_NOT_FOUND");
        }

        if (!feeling.parentEmotionId) {
            throw new Error("INVALID_FEELING");
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
        },
        include: {
            emotion: true,
            feeling: true
        }
    })

    return moodEntry;
}


export const updateMoodEntryService = async (id: string, data: updateMoodEntryBodyInput, idUser: number) => {

    const existingMoodEntry = await prisma.moodEntry.findFirst({
        where: {
            idMoodEntry: id,
            userId: idUser
        }
    })

    if (!existingMoodEntry) {
        throw new Error("MOOD_ENTRY_NOT_FOUND")
    }

    const updatedEmotionDate = data.emotionDate ?? existingMoodEntry.emotionDate;
    const updatedEmotionId = data.emotionId ?? existingMoodEntry.emotionId;
    const updatedIntensity = data.parentEmotionIntensity ?? existingMoodEntry.parentEmotionIntensity;
    const updatedFeelingId = data.feelingId !== undefined ? data.feelingId : existingMoodEntry.feelingId; // ici tu mets cette forme car ca pourrait être null c'est ça ? 
    const updatedComment = data.comment !== undefined ? data.comment : existingMoodEntry.comment;

    
    if (updatedEmotionId !== existingMoodEntry.emotionId) {
        // Vérifier que la nouvelle émotion existe et n'est pas supprimée
        const emotion = await prisma.emotion.findUnique({
            where: { idEmotion: updatedEmotionId }
        });
        if (!emotion || emotion.deletedAt) throw new Error("PRINCIPAL_EMOTION_DOES_NOT_EXIST");

        if (emotion.parentEmotionId) {
            throw new Error("INVALID_PRINCIPAL_EMOTION");
        }
        // Si un feeling existe, vérifier compatibilité
        if (updatedFeelingId) {
            const feeling = await prisma.emotion.findUnique({
                where: { idEmotion: updatedFeelingId }
            });
            if (!feeling || feeling.deletedAt) throw new Error("FEELING_NOT_FOUND");

            // Ici il faudrait peut-être vérifier que le parentEmotionId n'a pas été deletedAt
            if (!feeling.parentEmotionId) throw new Error("INVALID_FEELING");
            if (feeling.parentEmotionId !== updatedEmotionId) throw new Error("FEELING_NOT_LINKED_TO_EMOTION");
        }
    } else if (updatedFeelingId && updatedFeelingId !== existingMoodEntry.feelingId) {
        // SI feeling modifié seul
        const feeling = await prisma.emotion.findUnique({
            where: { idEmotion: updatedFeelingId }
        });
        if (!feeling || feeling.deletedAt) throw new Error("FEELING_NOT_FOUND");

        // Ici il faudrait peut-être vérifier que le parentEmotionId n'a pas été deletedAt
        if (!feeling.parentEmotionId) throw new Error("INVALID_FEELING");
        if (feeling.parentEmotionId !== updatedEmotionId) throw new Error("FEELING_NOT_LINKED_TO_EMOTION");
    }

    const normalizedUpdatedDate = new Date(Date.UTC(
        updatedEmotionDate.getFullYear(),
        updatedEmotionDate.getMonth(),
        updatedEmotionDate.getDate()
    ));

    // Vérifier unicité date par utilisateur
    if (normalizedUpdatedDate.getTime() !== existingMoodEntry.emotionDate.getTime()) {
        const conflict = await prisma.moodEntry.findFirst({
            where: {
                userId: idUser,
                emotionDate: normalizedUpdatedDate,
                idMoodEntry: { not: id }
            }
        });

        if (conflict) throw new Error("EMOTION_DATE_CONFLICT");
    }

    // Mise à jour
    const updatedMoodEntry = await prisma.moodEntry.update({
        where: { idMoodEntry: id },
        data: {
            emotionDate: normalizedUpdatedDate,
            emotionId: updatedEmotionId,
            parentEmotionIntensity: updatedIntensity,
            feelingId: updatedFeelingId ?? null,
            comment: updatedComment ?? null,
            updatedAt: new Date()
        },
        include: {
            emotion: true,
            feeling: true
        }
    });

    return updatedMoodEntry;
}


export const deleteMoodEntryService = async (id: string, idUser: number) => {

    const moodEntry = await prisma.moodEntry.findFirst({
        where: {
            idMoodEntry: id,
            userId: idUser
        }
    })

    if (!moodEntry) {
        throw new Error("MOOD_ENTRY_NOT_FOUND");
    }

    await prisma.moodEntry.delete({
        where: { idMoodEntry: id }
    });
}