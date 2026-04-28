import type { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service";

function q(val: unknown): string | undefined {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return String(val[0] ?? "");
  return undefined;
}

export const adminController = {
  // Users
  getUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getUsers({
        page: Number(q(req.query.page)) || 1,
        limit: Number(q(req.query.limit)) || 20,
        search: q(req.query.search),
        role: q(req.query.role),
        status: q(req.query.status),
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  getUserDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getUserDetail(String(req.params.userId));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  deactivateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.deactivateUser(String(req.params.userId));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  changeUserRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ error: "Role is required" });
        return;
      }
      const data = await adminService.changeUserRole(String(req.params.userId), role);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  resetUserPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.resetUserPassword(String(req.params.userId));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // Rooms
  getRooms: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getRooms({
        page: Number(q(req.query.page)) || 1,
        limit: Number(q(req.query.limit)) || 20,
        search: q(req.query.search),
        type: q(req.query.type),
        archived: q(req.query.archived),
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  getRoomDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getRoomDetail(String(req.params.roomId));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  archiveRoom: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.archiveRoom(String(req.params.roomId));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  hardDeleteMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.hardDeleteMessage(String(req.params.messageId));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // Safety
  getSafetyFlags: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getSafetyFlags({
        page: Number(q(req.query.page)) || 1,
        limit: Number(q(req.query.limit)) || 20,
        status: q(req.query.status),
        flagType: q(req.query.flag_type),
        dateFrom: q(req.query.date_from),
        dateTo: q(req.query.date_to),
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  reviewFlag: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const reviewerId = (req as any).user?.userId as string;
      if (!status) {
        res.status(400).json({ error: "Status is required" });
        return;
      }
      const data = await adminService.reviewFlag(String(req.params.flagId), status, reviewerId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // Stories
  getActiveStories: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getActiveStories();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  deleteStory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.deleteStory(String(req.params.storyId));
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // Analytics
  getAnalytics: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getAnalytics();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // Audit Log
  getAuditLog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getAuditLog({
        page: Number(q(req.query.page)) || 1,
        limit: Number(q(req.query.limit)) || 20,
        event: q(req.query.event),
        userId: q(req.query.user_id),
        dateFrom: q(req.query.date_from),
        dateTo: q(req.query.date_to),
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};
