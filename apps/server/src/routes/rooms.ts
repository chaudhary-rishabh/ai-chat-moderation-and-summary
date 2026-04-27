import { Router } from "express";
import * as roomsController from "../controllers/rooms.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();
router.use(verifyToken);

router.post("/", roomsController.createRoom);
router.get("/", roomsController.getRooms);
router.get("/:roomId", roomsController.getRoom);
router.post("/:roomId/members", roomsController.addMember);
router.delete("/:roomId/members/:userId", roomsController.removeMember);
router.get("/:roomId/messages", roomsController.getMessages);
router.post("/read", roomsController.markAsRead);

export const roomsRouter = router;
