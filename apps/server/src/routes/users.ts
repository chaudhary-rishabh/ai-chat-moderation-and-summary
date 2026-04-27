import { Router } from "express";
import { ChangePasswordSchema, UpdateProfileSchema } from "types/src/auth";
import * as usersController from "../controllers/users.controller";
import { verifyToken } from "../middleware/auth";
import { validateBody } from "../middleware/sanitize";

const router = Router();
router.use(verifyToken);

router.get("/me", usersController.getMe);
router.put("/me", validateBody(UpdateProfileSchema), usersController.updateMe);
router.patch("/me/password", validateBody(ChangePasswordSchema), usersController.changePassword);
router.patch("/me/last-seen", usersController.updateLastSeen);

export const usersRouter = router;
