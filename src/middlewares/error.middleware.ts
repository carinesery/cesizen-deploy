import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("🔥 ERROR: ", error.message, "sur", req.url);

    res. status(500).json({
        message: "Une erreur interne est survenue",
    });
};