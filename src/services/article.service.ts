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
            status: true,
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

export const getArticleService = async (slug: string) => {
    const article = await prisma.article.findFirst({
        where: {
            slug: slug,
        },
        include: {
            categories: {
                select: {
                    title: true,    
                    slug: true,
                }
            }
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
    }

    // Validation des catégories si elles sont fournies
    let categoriesCreate: any = undefined;
    if (data.categories !== undefined) {
        // Vérifier que toutes les catégories existent
        const existingCategories = await prisma.category.findMany({
            where: {
                slug: { in: data.categories }
            },
            select: { slug: true }
        });

        if (existingCategories.length !== data.categories.length) {
            const foundSlugs = existingCategories.map(cat => cat.slug);
            const notFoundSlugs = data.categories.filter(slug => !foundSlugs.includes(slug));
            throw new Error(`INVALID_CATEGORIES: ${notFoundSlugs.join(', ')}`);
        }

        categoriesCreate = {
            connect: data.categories.map((slug) => ({ slug }))
        };
    }

    return prisma.article.create({
        data: {
            title: data.title,
            slug,
            content: data.content,
            summary: data.summary,
            presentationImageUrl,
            authorId,
            status: data.status ?? "DRAFT",
            categories: categoriesCreate,
        },
        include: {
            categories: {
                select: { title: true, slug: true }
            }
        }
    });
};


export const updateArticle = async (oldSlug: string, data: UpdateArticleBodyInput, presentationImageUrl: string | null | undefined, authorId: string) => {
    const article = await prisma.article.findUnique({
        where: { slug: oldSlug },
    });

    if (!article) {
        throw new Error("ARTICLE_NOT_FOUND");
    }

    const newSlug = data.title ? generateSlug(data.title) : article.slug;

    if (newSlug !== oldSlug) {
        const existingSlug = await prisma.article.findUnique({ where: { slug: newSlug } });
        if (existingSlug) {
            throw new Error("ARTICLE_SLUG_ALREADY_EXISTS");
        }
    }

    const oldPresentationImageUrl = article.presentationImageUrl;

    // Validation des catégories si elles sont fournies
    let categoriesUpdate: any = undefined;
    if (data.categories !== undefined) {
        // Vérifier que toutes les catégories existent
        const existingCategories = await prisma.category.findMany({
            where: {
                slug: { in: data.categories }
            },
            select: { slug: true }
        });

        if (existingCategories.length !== data.categories.length) {
            const foundSlugs = existingCategories.map(cat => cat.slug);
            const notFoundSlugs = data.categories.filter(slug => !foundSlugs.includes(slug));
            throw new Error(`INVALID_CATEGORIES: ${notFoundSlugs.join(', ')}`);
        }

        // Utiliser 'set' pour remplacer complètement (permet aussi de supprimer si array vide)
        categoriesUpdate = {
            set: data.categories.map((slug) => ({ slug }))
        };
    }

    const updatedArticle = await prisma.article.update({
        where: { slug: oldSlug },
        data: {
            title: data.title ?? article.title,
            slug: newSlug,
            content: data.content !== undefined ? data.content : article.content,
            summary: data.summary !== undefined ? data.summary : article.summary,
            presentationImageUrl: presentationImageUrl === undefined
                ? article.presentationImageUrl
                : presentationImageUrl,
            updatedAt: new Date(),
            updatedById: authorId,
            status: data.status ?? article.status,
            categories: categoriesUpdate,
        },
        include: {
            categories: {
                select: { title: true, slug: true }
            }
        }
    });

    return {
        updatedArticle,
        oldPresentationImageUrl
    }
};

export const deleteArticleService = async (slug: string) => {

    const article = await prisma.article.findUnique({
        where: { slug },
    });

    if (!article) {
        throw new Error("ARTICLE_NOT_FOUND");
    }

    await prisma.article.delete({
        where: { slug },
    });

    return { message: "Article supprimé" };
};

