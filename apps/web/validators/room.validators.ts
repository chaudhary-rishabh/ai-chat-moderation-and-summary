import { z } from "zod";

export const CreateRoomSchema = z.object({
  type: z.enum(["dm", "group", "channel"]),
  name: z.string().trim().min(1).max(80).optional(),
  memberIds: z.array(z.string().uuid()).min(1, "Select at least one member"),
});

export const UpdateRoomSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).optional(),
});

export type CreateRoomData = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomData = z.infer<typeof UpdateRoomSchema>;
