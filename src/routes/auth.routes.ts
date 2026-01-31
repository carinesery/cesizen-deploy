import { Router } from "express";
import { registerController, confirmationEmailController, loginController, refreshTokenController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema, loginUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/register", validate(registerUserSchema), registerController);
router.get("/confirm-email", confirmationEmailController);
router.post("/login", validate(loginUserSchema), loginController);
router.post("/refresh-token", refreshTokenController);

export default router;