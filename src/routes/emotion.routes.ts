import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js"
import { validate } from "../middlewares/validate.middleware.js";
import { createEmotionSchema, getEmotionParamsSchema, updateEmotionParamsSchema, updateEmotionBodySchema, deleteEmotionParamsSchema } from "../schemas/emotion.schema.js"
import { getAllEmotionsController, getEmotionController, createEmotionController, updateEmotionController, deleteEmotionController } from "../controllers/emotion.controller.js";
import { UserRoleEnum } from "../utils/enum.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), getAllEmotionsController);
router.get("/:id", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(getEmotionParamsSchema, "params"), getEmotionController)
router.post("/", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), upload.single("iconUrl"), validate(createEmotionSchema, "body"), createEmotionController);
router.patch("/:id", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), upload.single("iconUrl"), validate(updateEmotionParamsSchema, "params"), validate(updateEmotionBodySchema, "body"), updateEmotionController);
router.delete("/:id", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(deleteEmotionParamsSchema, "params"), deleteEmotionController);

export default router;