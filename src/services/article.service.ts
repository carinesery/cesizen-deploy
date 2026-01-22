import { prisma } from "../prismaClient.js";
import { generateSlug } from "../utils/generatedSlug.js";

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
            status: data.status,
        },
    });
};