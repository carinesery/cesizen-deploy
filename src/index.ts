import express from "express";
import cookieParser from "cookie-parser";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import emotionsRoutes from "./routes/emotion.routes.js";
import moodEntriesRoutes from "./routes/mood-entry.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express(); 

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) =>  {
    res.send("Working")
});
app.use("/api/articles", articleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes)
app.use("/api/emotions", emotionsRoutes)
app.use("/api/mood-entries", moodEntriesRoutes)
app.use("/api/stats", statsRoutes)

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Serveur is running 🚀")
});

