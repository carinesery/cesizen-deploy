import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createMoodEntrySchema } from "../schemas/moodEntry.schema.js";
// import { createMoodEntryController } from "../schemas/moodEntry.controller.js";


const router = Router();

// router.post("/", authMiddleware, validate(createMoodEntrySchema, "body"), createMoodEntryController);


export default router;