import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getProfileController } from "../controllers/profile.controller.js";


const router = Router();

router.get("/", authMiddleware, getProfileController);

export default router;