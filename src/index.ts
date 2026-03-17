import express from "express";
import cookieParser from "cookie-parser";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import emotionsRoutes from "./routes/emotion.routes.js";
import moodEntriesRoutes from "./routes/moodEntry.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express(); 

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) =>  {
    res.send("Working")
});
app.use("/articles", articleRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes)
app.use("/emotions", emotionsRoutes)
app.use("/mood-entries", moodEntriesRoutes)

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Serveur is running 🚀")
});

