import { prisma } from "../prismaClient.js";
import { generateSlug } from "../utils/generatedSlug.js";
import { CreateArticleBodyInput, UpdateArticleBodyInput } from "../schemas/article.schema.js";


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


export const createArticle = async (data: CreateArticleBodyInput, presentationImageUrl: string | null, authorId: string) => {
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
            presentationImageUrl,
            authorId,
            updatedAt: null,
            status: data.status ?? "DRAFT",
        },
    });
};


export const updateArticle = async (oldSlug: string, data: UpdateArticleBodyInput, presentationImageUrl: string | null | undefined, authorId: string) => {
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

    // J'ajoute : 
    const oldPresentationImageUrl = article.presentationImageUrl;
    
    const updatedArticle = await prisma.article.update({
        where: { slug: oldSlug },
        data: {
            title: data.title ?? article.title,
            slug: newSlug,
            content: data.content ?? article.content,
            summary: data.summary ?? article.summary,
            presentationImageUrl: presentationImageUrl === undefined
                ? article.presentationImageUrl
                : presentationImageUrl,
            updatedAt: new Date(),
            updatedById: authorId,
            status: data.status ?? article.status,
        },
    });

    return {
        updatedArticle, 
        oldPresentationImageUrl
    }

};

