import { getPublicArticles, createArticle } from "../services/article.service.js";
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
                message: "Un artcile avec ce titre existe déjà",
            });
        }
        next(error);
    }
}