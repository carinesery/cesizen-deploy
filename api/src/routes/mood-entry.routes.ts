import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createMoodEntrySchema, getMoodEntryParamsSchema, updateMoodEntryParamsSchema, updateMoodEntryBodySchema, deleteMoodEntryParamsSchema } from "../schemas/moodEntry.schema.js";
import { createMoodEntryController, getAllMoodEntriesController, getMoodEntryController, updateMoodEntryController,deleteMoodEntryController } from "../controllers/moodEntry.controller.js";

const router = Router();

router.get("/", authMiddleware, getAllMoodEntriesController);
router.get("/:id", authMiddleware, validate(getMoodEntryParamsSchema, "params"), getMoodEntryController);
router.post("/", authMiddleware, validate(createMoodEntrySchema, "body"), createMoodEntryController);
router.patch("/:id", authMiddleware, validate(updateMoodEntryParamsSchema, "params"), validate(updateMoodEntryBodySchema, "body"), updateMoodEntryController);
router.delete("/:id", authMiddleware, validate(deleteMoodEntryParamsSchema, "params"), deleteMoodEntryController);


export default router;