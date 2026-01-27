import { Router } from "express";
import { getArticles, postArticle, patchArticle } from "../controllers/article.controller.js";

const router = Router();

router.get("/", getArticles);

// router.get("/:slug", getArtcileBySlug);

router.post("/", postArticle);
router.patch("/:slug", patchArticle);

export default router;