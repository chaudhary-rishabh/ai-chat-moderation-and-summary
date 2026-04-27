import { Router } from "express";
import {
  ForgotPasswordSchema,
  LoginSchema,
  LogoutSchema,
  RefreshSchema,
  RegisterSchema,
  ResetPasswordSchema,
} from "types/src/auth";
import * as authController from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../middleware/sanitize";

const router = Router();
router.use(authLimiter);

router.post("/register", validateBody(RegisterSchema), authController.register);
router.post("/login", validateBody(LoginSchema), authController.login);
router.post("/refresh", validateBody(RefreshSchema), authController.refresh);
router.post("/logout", verifyToken, validateBody(LogoutSchema), authController.logout);
router.post("/forgot-password", validateBody(ForgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validateBody(ResetPasswordSchema), authController.resetPassword);

export const authRouter = router;
