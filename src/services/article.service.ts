import { prisma } from "../prismaClient.js";

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