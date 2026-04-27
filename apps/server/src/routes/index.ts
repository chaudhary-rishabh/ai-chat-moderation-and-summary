import { Router } from "express";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { roomsRouter } from "./rooms";
import { messagesRouter } from "./messages";
import { storiesRouter } from "./stories";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/rooms", roomsRouter);
router.use("/rooms/:roomId/messages", messagesRouter);
router.use("/stories", storiesRouter);

export { router as apiRouter };
