import { Router } from "express";
import { getArticles, postArticle, patchArticle } from "../controllers/article.controller.js";
import { createArticleSchema, updateArticleSchema } from "../schemas/article.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/", getArticles);

// router.get("/:slug", getArtcileBySlug);

router.post("/", validate(createArticleSchema), postArticle);
router.patch("/:slug", validate(updateArticleSchema), patchArticle);

export default router;