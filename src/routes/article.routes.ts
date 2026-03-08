import { Router } from "express";
import { getArticles, getArticle, postArticle, patchArticle } from "../controllers/article.controller.js";
import { createArticleSchema, updateArticleSchema } from "../schemas/article.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/", getArticles);

router.get("/:slug", getArticle);
router.post("/", validate(createArticleSchema, "body"), postArticle);
router.patch("/:slug", validate(updateArticleSchema, "body"), patchArticle);

export default router;