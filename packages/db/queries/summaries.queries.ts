import { db, summaries } from "../src";
import { eq, desc, and } from "drizzle-orm";
import type { NewSummary } from "../schema";

export const insertSummary = (data: NewSummary) =>
  db.insert(summaries).values(data).returning();

export const getLatestSummary = (roomId: string, language: string) =>
  db.query.summaries.findFirst({
    where: and(eq(summaries.roomId, roomId), eq(summaries.language, language)),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
