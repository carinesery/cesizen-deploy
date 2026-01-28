import { prisma } from "../prismaClient.js";
import { generateSlug } from "../utils/generatedSlug.js";
import { z } from "zod";
import { createArticleSchema, updateArticleSchema } from "../schemas/article.schema.js";


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
        where: {
            status: "PUBLISHED",
        },
        orderBy: {
            updatedAt: "desc"
        },
    });
};

// A mettre en commentaire :
type CreateArticleInput = {
    title: string;
    content?: string;
    summary?: string;
    presentationImageUrl?: string;
    authorId: number; // devra venir de auth donc à modifier ensuite
    status?: "DRAFT" | "PUBLISHED";
}
export const createArticle = async (data: CreateArticleInput) => {
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
            authorId: data.authorId,
            updatedAt: null,
            status: data.status ?? "DRAFT",
        },
    });
};

// A mettre en commentaire aussi : 
type UpdateArticleInput = {
    title?: string;
    content?: string;
    summary?: string;
    presentationImageUrl?: string;
    status?: "DRAFT" | "PUBLISHED";
    updatedById: number;
    // Est ce que je passe updatedAt --> non je pense que je le gère du côté back-end
    // Est ce que je passe updatedBy ? Je ne sais pas où je le gère ... non je pense que c'est aussi côté back-end
}
export const updateArticle = async (oldSlug: string, data: UpdateArticleInput) => {
    const article = await prisma.article.findUnique({
        where: { slug: oldSlug }
    });

    if (!article) {
        throw new Error("ARTICLE_NOT_FOUND");
    }

    const newSlug = data.title ? generateSlug(data.title) : article.slug; // const newSlug = generateSlug(data.title); A modifier ?  

    if (newSlug !== oldSlug) {
        const existingSlug = await prisma.article.findUnique( { where: { slug: newSlug } });
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
            updatedById: data.updatedById, // La maj à faire sera sûrement updatedById: req.user.id
            status: data.status ?? article.status,
        },
    });

};

