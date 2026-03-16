import { Router } from "express";
import { registerController, confirmationEmailController, acceptLegalController, loginController, refreshTokenController, logoutController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema, confirmEmailSchema, acceptLegalSchema, loginUserSchema } from "../schemas/user.schema.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerUserSchema, "body"), registerController);
router.get("/confirm-email", validate(confirmEmailSchema, "query"), confirmationEmailController);
router.post("/accept-legal", validate(acceptLegalSchema, "body"), acceptLegalController);
router.post("/login", validate(loginUserSchema, "body"), loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", authMiddleware, logoutController);

export default router;