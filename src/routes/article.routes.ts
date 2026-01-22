import { Router } from "express";
import { getArticles, postArticle } from "../controllers/article.controller.js";

const router = Router();

router.get("/", getArticles);

// router.get("/:slug", getArtcileBySlug);

router.post("/", postArticle);

export default router;