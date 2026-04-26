import { db, refreshTokens, users } from "db/src";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { ChangePasswordSchema, UpdateProfileSchema } from "types/src";
import { AppError } from "../lib/errors";
import { auditLog } from "../middleware/audit";
import { verifyToken } from "../middleware/auth";
import { validateBody } from "../middleware/sanitize";

const router = Router();
router.use(verifyToken);

router.get("/me", async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.userId) });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/me", validateBody(UpdateProfileSchema), async (req, res, next) => {
  try {
    const [updated] = await db
      .update(users)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(users.id, req.user!.userId))
      .returning();
    if (!updated) throw new AppError(404, "User not found", "USER_NOT_FOUND");
    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatarUrl: updated.avatarUrl,
      isVerified: updated.isVerified,
      lastSeenAt: updated.lastSeenAt,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/me/avatar", async (req, res, next) => {
  try {
    if (typeof req.body?.avatarUrl !== "string" || req.body.avatarUrl.length < 10) {
      throw new AppError(400, "Invalid avatarUrl", "VALIDATION_ERROR");
    }
    const [updated] = await db
      .update(users)
      .set({ avatarUrl: req.body.avatarUrl, updatedAt: new Date() })
      .where(eq(users.id, req.user!.userId))
      .returning();
    if (!updated) throw new AppError(404, "User not found", "USER_NOT_FOUND");
    res.json({ avatarUrl: updated.avatarUrl });
  } catch (error) {
    next(error);
  }
});

router.patch("/me/password", validateBody(ChangePasswordSchema), async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.userId) });
    if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
    const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!valid) throw new AppError(401, "Current password is incorrect", "INVALID_CREDENTIALS");

    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, req.user!.userId));
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, req.user!.userId));
    auditLog("password_change")(req, res, () => {});
    res.json({ message: "Password updated" });
  } catch (error) {
    next(error);
  }
});

router.patch("/me/last-seen", async (req, res, next) => {
  try {
    await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, req.user!.userId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const usersRouter = router;
