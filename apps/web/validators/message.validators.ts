import { z } from "zod";

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(["text", "image", "video", "audio", "file"]).default("text"),
  mediaUrl: z.string().url().optional(),
  threadParentId: z.string().uuid().optional(),
});

export type SendMessageData = z.infer<typeof SendMessageSchema>;
