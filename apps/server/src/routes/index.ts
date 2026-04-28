import { Router } from "express";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { roomsRouter } from "./rooms";
import { messagesRouter } from "./messages";
import { storiesRouter } from "./stories";
import { aiRouter } from "./ai";
import { adminRouter } from "./admin";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/rooms", roomsRouter);
router.use("/rooms/:roomId/messages", messagesRouter);
router.use("/stories", storiesRouter);
router.use("/ai", aiRouter);
router.use("/admin", adminRouter);

export { router as apiRouter };
