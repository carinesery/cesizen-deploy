import { getPublicArticles, createArticle, updateArticle } from "../services/article.service.js";
import { Request, Response, NextFunction } from "express";

export const getArticles = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const articles = await getPublicArticles();
        res.status(200).json(articles);
    } catch (error) {
        next(error);
    }
}

export const postArticle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const article = await createArticle(req.body);
        res.status(201).json(article);
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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { slug } = req.params as { slug: string };

    try {
        const article = await updateArticle(slug, req.body);
        res.status(200).json(article);
    } catch (error) { // quelles sont les erreurs qui peuvent survenir au moment de l'enregistrement: slug déjà utilisé (409=conflit), article introuvable (404), données invalides (bad request) et pb serveur (500Z)
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