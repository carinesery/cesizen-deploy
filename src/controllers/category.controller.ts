import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { CreateCategoryBodyInput, UpdateCategoryBodyInput } from "../schemas/category.schema.js";
import { getAllCategoriesService, getCategoryService, createCategoryService, updateCategoryService, deleteCategoryService } from "../services/category.service.js";
import fs from "fs";
import path from "path";


export const getAllCategoriesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = await getAllCategoriesService();

        return res.status(200).json(categories);

    } catch (error) {
        next(error);
    }
}


export const getCategoryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { slug } = req.params as { slug: string };

    try {
        const category = await getCategoryService(slug);

        return res.status(200).json(category);

    } catch (error) {
        if (error instanceof Error &&
            error.message === "CATEGORY_NOT_FOUND") {
            return res.status(404).json({
                message: "Aucune categorie n'a été trouvée"
            });
        }
        next(error);
    }
}


export const createCategoryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    let newFilePath: string | null = null;
    let iconUrl: string | null = null;

    try {

        const data = req.body as CreateCategoryBodyInput;

        if (req.file) {
            newFilePath = path.join(process.cwd(), "uploads", req.file.filename);
            iconUrl = `/uploads/${req.file.filename}`;
        }

        const category = await createCategoryService(data, iconUrl);

        return res.status(201).json({ category });
    } catch (error) {
        // si échec et fichier uploadé, supprimer
        if (newFilePath && fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath);
        }
        if (error instanceof Error &&
            error.message === "CATEGORY_SLUG_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Une catégorie avec ce titre existe déjà",
            });
        }
        next(error);
    }
}


export const updateCategoryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    let newFilePath: string | null = null;
    let iconUrl: string | null | undefined;

    try {

        const { slug } = req.params as { slug: string };

        const data = req.body as UpdateCategoryBodyInput;

        // Changement d'image 
        if (req.file) {
            newFilePath = path.join(process.cwd(), "uploads", req.file.filename);
            iconUrl = `/uploads/${req.file.filename}`;
        }
        // Suppression explicite
        else if (req.body.removeIcon === true) {
            iconUrl = null
        }
        
        const { updatedCategory, oldIconUrl } = await updateCategoryService(slug, data, iconUrl);

        if (
            iconUrl !== undefined && // on a demandé un changement
            oldIconUrl // il y avait une ancienne image
        ) {
            const oldPath = path.join(process.cwd(), oldIconUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        return res.status(200).json(updatedCategory);

    } catch (error) {
        // si échec et fichier uploadé, supprimer
        if (newFilePath && fs.existsSync(newFilePath)) {
            fs.unlinkSync(newFilePath);
        }
        if (error instanceof Error &&
            error.message === "CATEGORY_NOT_FOUND") {
            return res.status(404).json({
                message: "Aucune catégorie n'a été trouvée"
            });
        }
        if (error instanceof Error &&
            error.message === "CATEGORY_SLUG_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Une catégorie avec ce titre existe déjà",
            });
        }
        next(error);
    }
}

export const deleteCategoryController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { slug } = req.params as { slug: string };

    try {
        const result = await deleteCategoryService(slug);
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        next(error);
    }
};