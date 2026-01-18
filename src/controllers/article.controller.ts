import { getPublicArticles } from "../services/article.service.js";
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