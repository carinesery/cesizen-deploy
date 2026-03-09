import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { adminRegisterSchema, adminUpdateUserSchema, userStatusSchema } from "../schemas/admin.schema.js";
import { getAllUsersController, getUserController, adminCreateUserController, updateUserController, setUserActiveStatusController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRoleEnum } from "../utils/enum.js";


const router = Router();

router.get("/users", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), getAllUsersController);
router.get("/user/:idUser", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), getUserController);
router.post("/user", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(adminRegisterSchema, "body"), adminCreateUserController);
router. patch("/user/:idUser", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(adminUpdateUserSchema, "body"), updateUserController);
router. patch("/users/:idUser/status", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(userStatusSchema, "body"), setUserActiveStatusController);
// A faire : PATCH /admin/users/:idUser/enable

// router.get("/test", (req, res) => {
//   res.send("ADMIN ROUTE OK");
// });

export default router;