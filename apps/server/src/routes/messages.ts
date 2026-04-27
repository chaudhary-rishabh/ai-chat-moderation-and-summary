import { Router } from "express";
import * as messagesController from "../controllers/messages.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

router.delete("/:messageId", messagesController.deleteMessage);
router.get("/search", messagesController.searchMessages);

export const messagesRouter = router;
