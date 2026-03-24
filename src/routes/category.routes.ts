import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRoleEnum } from "../utils/enum.js";
import { upload } from "../middlewares/upload.middleware.js";
import { createCategoryController, updateCategoryController, getAllCategoriesController, getCategoryController, deleteCategoryController } from "../controllers/category.controller.js";
import { createCategoryBodySchema, updateCategoryBodySchema } from "../schemas/category.schema.js";


const router = Router();

router.get("/", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), getAllCategoriesController);
router.get("/:slug", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), getCategoryController);
router.post("/", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), upload.single("iconUrl"), validate(createCategoryBodySchema, "body"), createCategoryController);
router.patch("/:slug", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), upload.single("iconUrl"), validate(updateCategoryBodySchema, "body"), updateCategoryController);
router.delete("/:slug", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), deleteCategoryController);
export default router;