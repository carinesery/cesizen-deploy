import { Router } from "express";
import { getArticles, getArticle, postArticle, patchArticle } from "../controllers/article.controller.js";
import { createArticleBodySchema, updateArticleBodySchema } from "../schemas/article.schema.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRoleEnum } from "../utils/enum.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getArticles);
router.get("/:slug", getArticle);
router.post("/", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN),  upload.single("presentationImageUrl"), validate(createArticleBodySchema, "body"), postArticle);
router.patch("/:slug", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), upload.single("presentationImageUrl"), validate(updateArticleBodySchema, "body"), patchArticle);

export default router;