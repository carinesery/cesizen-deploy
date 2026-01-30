import { Router } from "express";
import { register, confirmationEmail } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerUserSchema, loginUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/register", validate(registerUserSchema), register);
router.get("/confirm-email", confirmationEmail);
// router.post("/login", validate(loginUserSchema), login);

export default router;