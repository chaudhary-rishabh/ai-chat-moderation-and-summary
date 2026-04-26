import { Router } from "express";
import { authRouter } from "./auth";
import { usersRouter } from "./users";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);

export { router as apiRouter };
