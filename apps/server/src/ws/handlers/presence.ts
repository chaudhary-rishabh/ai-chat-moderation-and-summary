import type { WebSocket } from "ws";
import { PresencePingPayload } from "types/src/ws-events";
import { roomManager } from "../roomManager";
import { logger } from "../../lib/logger";

export const handlePresencePing = async (ws: WebSocket, _rawPayload: unknown): Promise<void> => {
  const userId = (ws as any).userId as string;
  try {
    await roomManager.refreshPresence(userId);
  } catch (err) {
    logger.error({ err, userId }, "ws_presence_ping_error");
  }
};
