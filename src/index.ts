import express from "express";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express(); 

app.use(express.json());
app.get("/", (req, res) =>  {
    res.send("Working")
});
app.use("/articles", articleRoutes);
app.use("/auth", authRoutes);

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Serveur is running 🚀")
});

