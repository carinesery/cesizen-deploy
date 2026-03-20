import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createMoodEntrySchema } from "../schemas/moodEntry.schema.js";
import { createMoodEntryController } from "../controllers/moodEntry.controller.js";

const router = Router();

/* GET    /mood-entries
GET    /mood-entries/:id
POST   /mood-entries
PATCH  /mood-entries/:id
DELETE /mood-entries/:id */

router.post("/", authMiddleware, validate(createMoodEntrySchema, "body"), createMoodEntryController);


export default router;