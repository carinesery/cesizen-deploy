import { Request, Response, NextFunction } from "express"
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { getStatsMoodEntriesService } from "../services/stats.service.js";


export const getStatsMoodEntriesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
          const idUser = req.user!.idUser;
           const { period } = req.query as { period: "week" | "month" | "year" };

        const statsMoodEntries = await getStatsMoodEntriesService(idUser, period);

        return res.status(200).json({ data: statsMoodEntries });
    } catch (error) {

        next(error)
    }
}