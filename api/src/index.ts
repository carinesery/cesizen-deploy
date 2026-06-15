import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet, { crossOriginResourcePolicy } from "helmet";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import emotionsRoutes from "./routes/emotion.routes.js";
import moodEntriesRoutes from "./routes/mood-entry.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import categoryRoutes from "./routes/category.routes.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

// 🛡️ Sécurité
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}
));

// 🌐 CORS - autorise le frontend React
app.use(cors({
    origin: process.env.FRONT_URL || "http://localhost:5173" || "https://cesizencs.uaenorth.cloudapp.azure.com",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🚦 Rate limiting global
app.use(globalLimiter);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) =>  {
    res.send("Working")
});
app.use("/uploads", express.static("uploads"));
app.use("/api/articles", articleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes)
app.use("/api/emotions", emotionsRoutes)
app.use("/api/mood-entries", moodEntriesRoutes)
app.use("/api/stats", statsRoutes)
app.use("/api/categories", categoryRoutes)

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Serveur is running 🚀")
});

