import { getPublicArticles, readArticle, createArticle, updateArticle } from "../services/article.service.js";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { CreateArticleInput } from "../schemas/article.schema.js";

export const getArticles = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const articles = await getPublicArticles();
        return res.status(200).json(articles);
    } catch (error) {
        next(error);
    }
}

export const getArticle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { slug } = req.params as { slug: string };

    try {
        const article = await readArticle(slug);
        return res.status(200).json(article);
    } catch (error) {
        if (error instanceof Error &&
            error.message === "ARTICLE_NOT_FOUND") {
            return res.status(404).json({
                message: "Aucun article n'a été trouvé"
            });
        }
         next(error);
    }
}

export const postArticle = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authorId = req.user!.idUser;

        const data = req.body as CreateArticleInput;

        const article = await createArticle(data, authorId);
        return res.status(201).json({ article });
    } catch (error) {
        if (error instanceof Error &&
            error.message === "ARTICLE_SLUG_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Un article avec ce titre existe déjà",
            });
        }
        next(error);
    }
}

export const patchArticle = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {

    const authorId = req.user!.idUser;

    const { slug } = req.params as { slug: string };

    try {
        const article = await updateArticle(slug, req.body, authorId);
        return res.status(200).json(article);
    } catch (error) { 
        if (error instanceof Error &&
            error.message === "ARTICLE_NOT_FOUND") {
            return res.status(404).json({
                message: "Aucun article n'a été trouvé"
            });
        }
        if (error instanceof Error &&
            error.message === "ARTICLE_SLUG_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Un article avec ce titre existe déjà",
            });
        }
        next(error);
    }
}