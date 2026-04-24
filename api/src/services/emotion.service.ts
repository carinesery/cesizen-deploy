import { prisma } from "../prismaClient.js";
import { CreateEmotionInput, UpdateEmotionBodyInput } from "../schemas/emotion.schema.js";
import { LevelEmotionEnum } from "../utils/enum.js";

export const getAllEmotionsService = async () => {

    const emotions = await prisma.emotion.findMany({
        where: {
            level: LevelEmotionEnum.LEVEL_1,
            deletedAt: null
        },
        orderBy: { title: "asc" },
        include: {
            childEmotions: {
                where: { deletedAt: null }
            }
        }
    });

    if (emotions.length === 0) {
        throw new Error("LIST_OF_EMOTIONS_DOES_NOT_EXIST")
    }

    return emotions;
}

export const getEmotionService = async (id: string) => {

    const emotion = await prisma.emotion.findUnique({
        where: { idEmotion: id },
        include: {
            childEmotions: { where: { deletedAt: null } },
            parentEmotion: true
        }
    })

    if (!emotion || emotion.deletedAt) {
        throw new Error("EMOTION_NOT_FOUND")
    };

    if (emotion.parentEmotion?.deletedAt) {
        throw new Error("DATA_INCONSISTENCY_PARENT_DELETED");
    }

    return emotion;
}

export const createEmotionService = async (data: CreateEmotionInput, iconUrl: string | undefined) => {

    if (data.parentEmotionId && data.level === LevelEmotionEnum.LEVEL_1) {
        throw new Error("LEVEL_1_CANNOT_HAVE_PARENT")
    };

    if (data.level === LevelEmotionEnum.LEVEL_2 && !data.parentEmotionId) {
        throw new Error("LEVEL_2_REQUIRES_PARENT");
    }

    if (data.parentEmotionId) {
        const parentExists = await prisma.emotion.findUnique({
            where: {
                idEmotion: data.parentEmotionId,
            }
        });

        if (!parentExists || parentExists.deletedAt) {
            throw new Error("PARENT_EMOTION_NOT_FOUND");
        }
    }

    const emotionExists = await prisma.emotion.findFirst({
        where: {
            title: data.title,
            deletedAt: null
        }
    })

    if (emotionExists) {
        throw new Error("EMOTION_ALREADY_EXISTS")
    };

    const emotionStored = await prisma.emotion.create({
        data: {
            title: data.title,
            level: data.level,
            description: data.description,
            iconUrl,
            parentEmotionId: data.parentEmotionId
        }
    })

    return emotionStored;
}

export const updateEmotionService = async (id: string, data: UpdateEmotionBodyInput, iconUrl: string | null | undefined) => {

    const existingEmotion = await prisma.emotion.findUnique({
        where: { idEmotion: id },
        include: {
            childEmotions: { where: { deletedAt: null } },
        }
    })

    if (!existingEmotion || existingEmotion.deletedAt) {
        throw new Error("EMOTION_NOT_FOUND")
    };

    const finalLevel = data.level ?? existingEmotion.level;

    const finalParent = data.parentEmotionId !== undefined
        ? data.parentEmotionId
        : existingEmotion.parentEmotionId;

    if (finalParent) {
        const parent = await prisma.emotion.findUnique({
            where: { idEmotion: finalParent }
        });

        if (!parent || parent.deletedAt) {
            throw new Error("PARENT_EMOTION_NOT_FOUND");
        }
        if (parent.level !== LevelEmotionEnum.LEVEL_1) {
            throw new Error("INVALID_PARENT_LEVEL");
        }
    }

    if (finalParent === id) {
        throw new Error("EMOTION_CANNOT_BE_ITS_OWN_PARENT");
    }

    if (existingEmotion.level === LevelEmotionEnum.LEVEL_1
        && finalLevel === LevelEmotionEnum.LEVEL_2
        && existingEmotion.childEmotions.length > 0) {
        throw new Error("CANNOT_DOWNGRADE_WITH_CHILDREN");
    }

    if (finalLevel === LevelEmotionEnum.LEVEL_1 && finalParent) {
        throw new Error("LEVEL_1_CANNOT_HAVE_PARENT")
    };

    if (finalLevel === LevelEmotionEnum.LEVEL_2 && !finalParent) {
        throw new Error("LEVEL_2_REQUIRES_PARENT");
    }

    const oldIconUrl = existingEmotion.iconUrl;

    const emotionUpdated = await prisma.emotion.update({
        where: { idEmotion: id },
        data: {
              ...data,
        iconUrl: iconUrl === undefined
                ? existingEmotion.iconUrl
                : iconUrl
    }
    })

    return { emotionUpdated, oldIconUrl }
}

export const deleteEmotionService = async (id: string) => {

    const emotion = await prisma.emotion.findUnique({
        where: { idEmotion: id },
        include: {
            childEmotions: {
                where: { deletedAt: null }
            }
        }
    })

    if (!emotion || emotion.deletedAt) {
        throw new Error("EMOTION_NOT_FOUND")
    }

    if (emotion.level === LevelEmotionEnum.LEVEL_1 && emotion.childEmotions.length > 0) {
        throw new Error("CANNOT_DELETE_WITH_CHILDREN")
    }
    await prisma.emotion.update({
        where: { idEmotion: id },
        data: {
            deletedAt: new Date()
        }
    })
}
