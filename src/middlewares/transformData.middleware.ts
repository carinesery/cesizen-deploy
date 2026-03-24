import { Request, Response, NextFunction } from "express";

export const transformFormData = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.categories) {
        try {
            req.body.categories = JSON.parse(req.body.categories);
        } catch {
            req.body.categories = [req.body.categories];
        }
    }
    console.log("La requête est passée par le transformData");

    next();
};