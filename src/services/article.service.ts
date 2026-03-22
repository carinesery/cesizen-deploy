import { prisma } from "../prismaClient.js";
import { generateSlug } from "../utils/generatedSlug.js";
import { CreateArticleInput, UpdateArticleInput } from "../schemas/article.schema.js";


export const getPublicArticles = async () => {
    return prisma.article.findMany({
        select: {
            idArticle: true,
            title: true,
            slug: true,
            summary: true,
            createdAt: true,
            updatedAt: true,
            categories: {
                select: {
                    title: true,
                    slug: true,
                },
            },
        },
        // where: { status: "PUBLISHED" },
        orderBy: {
            updatedAt: "desc"
        },
    });
};

export const readArticle = async (slug: string) => {
    const article = await prisma.article.findFirst({
        where: {
            slug: slug,
        }
    });

    if (!article) {
        throw new Error("ARTICLE_NOT_FOUND");
    }

    return article
};


export const createArticle = async (data: CreateArticleInput, authorId: string) => {
    const slug = generateSlug(data.title);

    const existingSlug = await prisma.article.findUnique({
        where: { slug },
    });

    if (existingSlug) {
        throw new Error("ARTICLE_SLUG_ALREADY_EXISTS");
    };

    return prisma.article.create({
        data: {
            title: data.title,
            slug,
            content: data.content,
            summary: data.summary,
            presentationImageUrl: data.presentationImageUrl,
            authorId,
            updatedAt: null,
            status: data.status ?? "DRAFT",
        },
    });
};


export const updateArticle = async (oldSlug: string, data: UpdateArticleInput, authorId: string) => {
    const article = await prisma.article.findUnique({
        where: { slug: oldSlug }
    });

    if (!article) {
        throw new Error("ARTICLE_NOT_FOUND");
    }

    const newSlug = data.title ? generateSlug(data.title) : article.slug; // const newSlug = generateSlug(data.title); A modifier ?  

    if (newSlug !== oldSlug) {
        const existingSlug = await prisma.article.findUnique({ where: { slug: newSlug } });
        if (existingSlug) {
            throw new Error("ARTICLE_SLUG_ALREADY_EXISTS");
        };
    };


    return prisma.article.update({
        where: { slug: oldSlug },
        data: {
            title: data.title ?? article.title,
            slug: newSlug,
            content: data.content ?? article.content,
            summary: data.summary ?? article.summary,
            presentationImageUrl: data.presentationImageUrl ?? article.presentationImageUrl,
            updatedAt: new Date(),
            updatedById: authorId, // La maj à faire sera sûrement updatedById: req.user.id
            status: data.status ?? article.status,
        },
    });

};

