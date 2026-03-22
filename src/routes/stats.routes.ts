// moodEntryStats.router.ts
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { getStatsQuerySchema } from "../schemas/stats.schema.js";
import { getStatsMoodEntriesController } from "../controllers/stats.controller.js";

const router = Router();

router.get("/", authMiddleware, validate(getStatsQuerySchema, "query"), getStatsMoodEntriesController);

export default router;