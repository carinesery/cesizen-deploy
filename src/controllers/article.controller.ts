import { getPublicArticles, readArticle, createArticle, updateArticle } from "../services/article.service.js";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { CreateArticleBodyInput, UpdateArticleBodyInput } from "../schemas/article.schema.js";
import fs from "fs";
import path from "path";

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
    let newFilePath: string | null = null;

    try {
        const authorId = req.user!.idUser;

        const data = req.body as CreateArticleBodyInput;

        let presentationImageUrl: string | null = null;

        if (req.file) {
            newFilePath = path.join(process.cwd(), "uploads", req.file.filename);
            presentationImageUrl = `/uploads/${req.file.filename}`;
        }

        const article = await createArticle(data, presentationImageUrl, authorId);

        return res.status(201).json({ article });
    } catch (error) {
        // si échec et fichier uploadé, supprimer
        if (newFilePath && fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath);
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

export const patchArticle = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    let newFilePath: string | null = null;
    let presentationImageUrl: string | null | undefined;

    try {
        const authorId = req.user!.idUser;

        const { slug } = req.params as { slug: string };

        const data = req.body as UpdateArticleBodyInput;

        // Changement d'image 
        if (req.file) {
            newFilePath = path.join(process.cwd(), "uploads", req.file.filename);
            presentationImageUrl = `/uploads/${req.file.filename}`;
        }
        // Suppression explicite
        else if (req.body.presentationImageUrl === "null") {
            presentationImageUrl = null
        }

        const { updatedArticle, oldPresentationImageUrl } = await updateArticle(slug, data, presentationImageUrl, authorId);

        if (
            presentationImageUrl !== undefined && // on a demandé un changement
            oldPresentationImageUrl // il y avait une ancienne image
        ) {
            const oldPath = path.join(process.cwd(), oldPresentationImageUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        return res.status(200).json(updatedArticle);

    } catch (error) {
        // si échec et fichier uploadé, supprimer
        if (newFilePath && fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath);
        }
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