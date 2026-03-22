import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { adminRegisterSchema, adminUpdateUserParamsSchema, adminUpdateUserBodySchema, getUserParamsSchema, userStatusParamsSchema, userStatusBodySchema, deleteUserParamsSchema } from "../schemas/admin.schema.js";
import { getAllUsersController, getUserController, adminCreateUserController, updateUserController, setUserActiveStatusController, deleteUserController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRoleEnum } from "../utils/enum.js";


const router = Router();

router.get("/users", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), getAllUsersController);
router.get("/users/:id", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(getUserParamsSchema, "params"), getUserController);
router.post("/users", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(adminRegisterSchema, "body"), adminCreateUserController);
router.patch("/users/:id", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(adminUpdateUserParamsSchema, "params"), validate(adminUpdateUserBodySchema, "body"), updateUserController);
router.patch("/users/:id/status", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(userStatusParamsSchema, "params"), validate(userStatusBodySchema, "body"), setUserActiveStatusController);
router.delete("/users/:id", authMiddleware, roleMiddleware(UserRoleEnum.ADMIN), validate(deleteUserParamsSchema, "params"), deleteUserController);


export default router;