import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { aiController } from "../controllers/ai.controller";

const router = Router();

router.get("/summarize/:roomId", verifyToken, aiController.summarize);
router.post("/suggest", verifyToken, aiController.suggest);
router.post("/chat", verifyToken, aiController.chat);
router.get("/chat/stream", verifyToken, aiController.chatStream);
router.get("/chat/session", verifyToken, aiController.getChatSession);

export { router as aiRouter };
