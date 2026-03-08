import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { adminRegisterSchema } from "../schemas/admin.schema.js";
import { getAllUsersController, adminCreateUserController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRoleEnum } from "../utils/enum.js";


const router = Router();

router.get("/users", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), getAllUsersController);
router.post("/user", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(adminRegisterSchema, "body"), adminCreateUserController);
// router.get("/test", (req, res) => {
//   res.send("ADMIN ROUTE OK");
// });

export default router;