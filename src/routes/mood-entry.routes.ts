import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createMoodEntrySchema, getMoodEntryParamsSchema, updateMoodEntryParamsSchema, updateMoodEntryBodySchema } from "../schemas/moodEntry.schema.js";
import { createMoodEntryController, getAllMoodEntriesController, getMoodEntryController, updateMoodEntryController } from "../controllers/moodEntry.controller.js";

const router = Router();

/* GET    /mood-entries
GET    /mood-entries/:id
POST   /mood-entries
PATCH  /mood-entries/:id
DELETE /mood-entries/:id */
router.get("/", authMiddleware, getAllMoodEntriesController);
router.get("/:id", authMiddleware, validate(getMoodEntryParamsSchema, "params"), getMoodEntryController);
router.post("/", authMiddleware, validate(createMoodEntrySchema, "body"), createMoodEntryController);
router.patch("/:id", authMiddleware, validate(updateMoodEntryParamsSchema, "params"), validate(updateMoodEntryBodySchema, "body"), updateMoodEntryController);


export default router;