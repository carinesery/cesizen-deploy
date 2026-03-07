import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getProfileController } from "../controllers/profile.controller.js";
import { updateProfileController } from "../controllers/profile.controller.js";
import { updatedProfileUserSchema } from "../schemas/profile.schema.js";


const router = Router();

router.get("/", authMiddleware, getProfileController);
router.patch("/update", authMiddleware, validate(updatedProfileUserSchema, "body"), updateProfileController);

export default router;