import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js"
import { validate } from "../middlewares/validate.middleware.js";
import { createEmotionSchema, getEmotionParamsSchema } from "../schemas/emotion.schema.js"
import { getAllEmotionsController, getEmotionController, createEmotionController } from "../controllers/emotion.controller.js";
import { UserRoleEnum } from "../utils/enum.js";

const router = Router();

router.get("/", authMiddleware, getAllEmotionsController);
router.get("/:id", authMiddleware, validate(getEmotionParamsSchema, "params"), getEmotionController)
router.post("/", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(createEmotionSchema, "body"), createEmotionController);

export default router;