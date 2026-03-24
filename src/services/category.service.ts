import { prisma } from "../prismaClient.js";
import { generateSlug } from "../utils/generatedSlug.js";
import { CreateCategoryBodyInput, UpdateCategoryBodyInput } from "../schemas/category.schema.js";


export const getAllCategoriesService = async () => {
    return prisma.category.findMany({
        select: {
            idCategory: true,
            title: true,
            slug: true,
            description: true,
            iconUrl: true,
            articles: {
                select: {
                    title: true,
                    slug: true,
                },
                orderBy: {
                    title: "asc"
                }
            },
        },
        orderBy: {
            title: "asc"
        },
    });
};


export const getCategoryService = async (slug: string) => {
    const category = await prisma.category.findFirst({
        where: {
            slug: slug,
        }
    });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    return category
};


export const createCategoryService = async (data: CreateCategoryBodyInput, iconUrl: string | null) => {
    const slug = generateSlug(data.title);

    const existingSlug = await prisma.category.findUnique({
        where: { slug },
    });

    if (existingSlug) {
        throw new Error("CATEGORY_SLUG_ALREADY_EXISTS");
    };

    return prisma.category.create({
        data: {
            title: data.title,
            slug,
            description: data.description,
            iconUrl,
        },
    });
};


export const updateCategoryService = async (oldSlug: string, data: UpdateCategoryBodyInput, iconUrl: string | null | undefined) => {
    const category = await prisma.category.findUnique({
        where: { slug: oldSlug }
    });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    const newSlug = data.title ? generateSlug(data.title) : category.slug;

    if (newSlug !== oldSlug) {
        const existingSlug = await prisma.category.findUnique({ where: { slug: newSlug } });
        if (existingSlug) {
            throw new Error("CATEGORY_SLUG_ALREADY_EXISTS");
        };
    };

    const oldIconUrl = category.iconUrl;

    const updatedCategory = await prisma.category.update({
        where: { slug: oldSlug },
        data: {
            title: data.title ?? category.title,
            slug: newSlug,
            description: data.description ?? category.description,
            iconUrl: iconUrl === undefined
                ? category.iconUrl
                : iconUrl,
        },
    });

    return {
        updatedCategory,
        oldIconUrl
    }

};

export const deleteCategoryService = async (slug: string) => {
    const category = await prisma.category.findUnique({
        where: { slug },
    });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    await prisma.category.delete({
        where: { slug },
    });

    return { message: "Catégorie supprimée" };
};
