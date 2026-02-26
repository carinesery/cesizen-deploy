import { Router } from "express";
import { registerController, confirmationEmailController, acceptLegalController, loginController, refreshTokenController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema, confirmEmailSchema, loginUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/register", validate(registerUserSchema, "body"), registerController);
router.get("/confirm-email", validate(confirmEmailSchema, "query"), confirmationEmailController);
router.post("/accept-legal", acceptLegalController); // quel middleware ?
router.post("/login", validate(loginUserSchema, "body"), loginController);
router.post("/refresh-token", refreshTokenController);

export default router;