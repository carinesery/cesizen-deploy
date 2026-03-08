import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getProfileController } from "../controllers/profile.controller.js";
import { updateProfileController, updatePasswordController } from "../controllers/profile.controller.js";
import { updatedProfileUserSchema, updatedPasswordSchema } from "../schemas/profile.schema.js";


const router = Router();

router.get("/", authMiddleware, getProfileController);
router.patch("/update-profile", authMiddleware, validate(updatedProfileUserSchema, "body"), updateProfileController);
router.patch("/update-password", authMiddleware, validate(updatedPasswordSchema, "body"), updatePasswordController);


export default router;