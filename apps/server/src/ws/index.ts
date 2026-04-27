import type { IncomingMessage } from "node:http";
import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyAccessToken } from "../lib/jwt";
import { logger } from "../lib/logger";
import { roomManager } from "./roomManager";
import { handleMsgSend } from "./handlers/message";
import { handleTypingStart, handleTypingStop } from "./handlers/typing";
import { handlePresencePing } from "./handlers/presence";
import { handleReactionAdd, handleReactionRemove } from "./handlers/reaction";
import { getRoomsForUser } from "db/queries";
import { getUserById } from "db/queries";

const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB

type WsHandler = (ws: WebSocket, payload: unknown) => void | Promise<void>;

const handlers: Record<string, WsHandler> = {
  "msg:send": handleMsgSend,
  "typing:start": handleTypingStart,
  "typing:stop": handleTypingStop,
  "reaction:add": handleReactionAdd,
  "reaction:remove": handleReactionRemove,
  "presence:ping": handlePresencePing,
};

export const initWsServer = (httpServer: Server): void => {
  const wss = new WebSocketServer({ noServer: true });

  // ── Upgrade handler ────────────────────────────────────────────────────────

  httpServer.on("upgrade", async (req: IncomingMessage, socket, head) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const token = url.searchParams.get("token");

      if (!token) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const payload = verifyAccessToken(token);

      // Fetch user info and room memberships
      const [user, memberships] = await Promise.all([
        getUserById(payload.userId),
        getRoomsForUser(payload.userId),
      ]);

      if (!user || !user.isActive) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const roomIds = memberships.map((m) => m.room.id);

      wss.handleUpgrade(req, socket, head, (ws) => {
        // Attach auth info to the socket
        (ws as any).userId = payload.userId;
        (ws as any).role = payload.role;
        (ws as any).isAlive = true;

        wss.emit("connection", ws, req);

        // Register with room manager
        roomManager.handleConnect(
          ws,
          payload.userId,
          { name: user.name, avatarUrl: user.avatarUrl },
          roomIds,
        );
      });
    } catch (err) {
      logger.warn({ err }, "ws_upgrade_rejected");
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────────

  wss.on("connection", (ws: WebSocket) => {
    const userId = (ws as any).userId as string;

    ws.on("message", (raw: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        // Check payload size
        const size = Array.isArray(raw)
          ? raw.reduce((acc, b) => acc + b.length, 0)
          : raw.byteLength;
        if (size > MAX_PAYLOAD_BYTES) {
          ws.close(1009, "Message too large");
          return;
        }

        const data = JSON.parse(raw.toString());
        const handler = handlers[data.type];
        if (!handler) {
          ws.send(JSON.stringify({ type: "error", payload: { code: "UNKNOWN_EVENT", message: `Unknown event: ${data.type}` } }));
          return;
        }

        void handler(ws, data.payload);
      } catch (err) {
        logger.error({ err, userId }, "ws_message_parse_error");
        ws.send(JSON.stringify({ type: "error", payload: { code: "PARSE_ERROR", message: "Invalid message format" } }));
      }
    });

    ws.on("close", () => {
      roomManager.handleDisconnect(ws, userId);
    });

    ws.on("error", (err) => {
      logger.error({ err, userId }, "ws_socket_error");
    });

    // Heartbeat
    ws.on("pong", () => {
      (ws as any).isAlive = true;
    });
  });

  // ── Heartbeat interval ─────────────────────────────────────────────────────

  const heartbeatInterval = setInterval(() => {
    for (const ws of wss.clients) {
      if ((ws as any).isAlive === false) {
        logger.warn("ws_heartbeat_timeout");
        ws.terminate();
        continue;
      }
      (ws as any).isAlive = false;
      ws.ping();
    }
  }, 30_000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  logger.info("ws_server_initialized");
};
