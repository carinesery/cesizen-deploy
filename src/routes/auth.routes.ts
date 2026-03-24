import { Router } from "express";
import { registerController, confirmationEmailController, acceptLegalController, loginController, refreshTokenController, logoutController, forgotPasswordController, resetPasswordController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema, confirmEmailSchema, acceptLegalSchema, loginUserSchema, forgotPasswordBodySchema, resetPasswordBodySchema } from "../schemas/user.schema.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, upload.single("profilPictureUrl"), validate(registerUserSchema, "body"), registerController);
router.get("/confirm-email", validate(confirmEmailSchema, "query"), confirmationEmailController);
router.post("/accept-legal", validate(acceptLegalSchema, "body"), acceptLegalController); 
router.post("/login", authLimiter, validate(loginUserSchema, "body"), loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", authMiddleware, logoutController);
router.post("/forgot-password", authLimiter, validate(forgotPasswordBodySchema, "body"), forgotPasswordController);
router.post("/reset-password", authLimiter, validate(resetPasswordBodySchema, "body"), resetPasswordController);

export default router;