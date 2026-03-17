import { prisma } from "../prismaClient.js";
import { createEmotionInput } from "../schemas/emotion.schema.js";
import { LevelEmotionEnum } from "../utils/enum.js";

export const getAllEmotionsService = async () => {

    const emotions = await prisma.emotion.findMany({
        where: { level: LevelEmotionEnum.LEVEL_1 },
        orderBy: { title: "asc" },
        include: {
            childEmotions: true
        }
    });

    if (emotions.length === 0) {
        throw new Error("LIST_OF_EMOTIONS_DOES_NOT_EXIST")
    }

    // là je pense qu'il faudrait mapper sur la liste des émotions pour faire apparaitre dans l'ordre de rattachement à l'émotion parent non ?

    return emotions;
}

export const getEmotionService = async (id: string) => {

    const emotion = await prisma.emotion.findUnique({
        where: { idEmotion: id },
        include: {
            childEmotions: true,
            parentEmotion: true
        }
    })

    if (!emotion) {
        throw new Error("EMOTION_NOT_FOUND")
    };

    return emotion;
}

export const createEmotionService = async (data: createEmotionInput) => {

    if (data.parentEmotionId && data.level === LevelEmotionEnum.LEVEL_1) {
        throw new Error("LEVEL_1_CANNOT_HAVE_PARENT")
    };

    if (data.level === LevelEmotionEnum.LEVEL_2 && !data.parentEmotionId) {
        throw new Error("LEVEL_2_REQUIRES_PARENT");
    }

    if (data.parentEmotionId) {
        const parentExists = await prisma.emotion.findUnique({
            where: { idEmotion: data.parentEmotionId }
        });

        if (!parentExists) {
            throw new Error("PARENT_EMOTION_NOT_FOUND");
        }
    }

    const emotionExists = await prisma.emotion.findUnique({
        where: { title: data.title }
    })

    if (emotionExists) {
        throw new Error("EMOTION_ALREADY_EXISTS")
    };

    const emotionStored = await prisma.emotion.create({
        data: {
            title: data.title,
            level: data.level,
            description: data.description,
            iconUrl: data.iconUrl,
            parentEmotionId: data.parentEmotionId
        }
    })

    return emotionStored;

}
