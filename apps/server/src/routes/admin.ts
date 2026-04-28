import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { verifyToken, requireRole } from "../middleware/auth";

const router = Router();

// All admin routes require auth + admin/superadmin role
router.use(verifyToken);
router.use(requireRole("admin", "superadmin"));

// Users
router.get("/users", adminController.getUsers);
router.get("/users/:userId", adminController.getUserDetail);
router.put("/users/:userId/deactivate", adminController.deactivateUser);
router.put("/users/:userId/role", adminController.changeUserRole);
router.post("/users/:userId/reset-password", adminController.resetUserPassword);

// Rooms
router.get("/rooms", adminController.getRooms);
router.get("/rooms/:roomId", adminController.getRoomDetail);
router.put("/rooms/:roomId/archive", adminController.archiveRoom);

// Messages
router.delete("/messages/:messageId", adminController.hardDeleteMessage);

// Safety
router.get("/safety/flags", adminController.getSafetyFlags);
router.put("/safety/flags/:flagId/review", adminController.reviewFlag);

// Stories
router.get("/stories", adminController.getActiveStories);
router.delete("/stories/:storyId", adminController.deleteStory);

// Analytics
router.get("/analytics", adminController.getAnalytics);

// Audit Log
router.get("/audit-log", adminController.getAuditLog);

export { router as adminRouter };
