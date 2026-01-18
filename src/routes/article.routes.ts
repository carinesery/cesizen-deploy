import { Router } from "express";
import { getArticles } from "../controllers/article.controller.js";

const router = Router();

router.get("/", getArticles);

export default router;