import type { WebSocket } from "ws";
import { redis } from "../lib/redis";
import { logger } from "../lib/logger";
import type { ServerToClientEvent } from "types/src/ws-events";

class RoomManager {
  private sockets = new Map<string, Set<WebSocket>>();
  private rooms = new Map<string, Set<string>>();
  private redisPub = redis;
  private redisSub = redis.duplicate();
  private userInfo = new Map<string, { name: string; avatarUrl: string | null }>();

  constructor() {
    this.setupRedisSubscriber();
  }

  handleConnect(ws: WebSocket, userId: string, userInfo: { name: string; avatarUrl: string | null }, roomIds: string[]): void {
    if (!this.sockets.has(userId)) {
      this.sockets.set(userId, new Set());
    }
    this.sockets.get(userId)!.add(ws);
    this.userInfo.set(userId, userInfo);

    for (const roomId of roomIds) {
      this.joinRoom(userId, roomId, false);
    }

    void this.redisPub.set(`presence:${userId}`, "online", "EX", 35);

    for (const roomId of roomIds) {
      void this.redisPub.publish(
        `room:${roomId}`,
        JSON.stringify({ type: "presence:update", payload: { userId, status: "online" } }),
      );
    }

    logger.info({ userId, roomCount: roomIds.length }, "ws_connect");
  }

  handleDisconnect(ws: WebSocket, userId: string): void {
    const userSockets = this.sockets.get(userId);
    if (!userSockets) return;

    userSockets.delete(ws);

    if (userSockets.size === 0) {
      this.sockets.delete(userId);
      this.userInfo.delete(userId);

      for (const [roomId, userIds] of this.rooms) {
        userIds.delete(userId);
        if (userIds.size === 0) this.rooms.delete(roomId);
      }

      void this.redisPub.del(`presence:${userId}`);
      void this.redisPub.publish(
        "presence:global",
        JSON.stringify({ type: "presence:update", payload: { userId, status: "offline" } }),
      );

      logger.info({ userId }, "ws_disconnect");
    }
  }

  joinRoom(userId: string, roomId: string, publish = true): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(userId);
    if (publish) {
      void this.redisPub.publish(
        `room:${roomId}`,
        JSON.stringify({ type: "presence:update", payload: { userId, status: "online" } }),
      );
    }
  }

  leaveRoom(userId: string, roomId: string): void {
    const userIds = this.rooms.get(roomId);
    if (!userIds) return;
    userIds.delete(userId);
    if (userIds.size === 0) this.rooms.delete(roomId);
  }

  broadcast(roomId: string, event: ServerToClientEvent, excludeUserId?: string): void {
    const data = JSON.stringify(event);
    const userIds = this.rooms.get(roomId);

    if (userIds) {
      for (const userId of userIds) {
        if (userId === excludeUserId) continue;
        const userSockets = this.sockets.get(userId);
        if (userSockets) {
          for (const ws of userSockets) {
            if (ws.readyState === ws.OPEN) ws.send(data);
          }
        }
      }
    }

    void this.redisPub.publish(`room:${roomId}`, data);
  }

  sendToUser(userId: string, event: ServerToClientEvent): void {
    const data = JSON.stringify(event);
    const userSockets = this.sockets.get(userId);
    if (userSockets) {
      for (const ws of userSockets) {
        if (ws.readyState === ws.OPEN) ws.send(data);
      }
    }
  }

  sendToAdmins(event: ServerToClientEvent): void {
    void this.redisPub.publish("admin:alerts", JSON.stringify(event));
  }

  private setupRedisSubscriber(): void {
    void this.redisSub.psubscribe("room:*", "admin:alerts");

    this.redisSub.on("pmessage", (_pattern: string, channel: string, message: string) => {
      try {
        if (channel === "admin:alerts") {
          const data = JSON.parse(message);
          for (const [, userSockets] of this.sockets) {
            for (const ws of userSockets) {
              const role = (ws as any).role as string | undefined;
              if ((role === "admin" || role === "superadmin") && ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(data));
              }
            }
          }
          return;
        }
        this.forwardToRoom(channel.slice("room:".length), message);
      } catch (err) {
        logger.error({ err, channel }, "redis_sub_parse_error");
      }
    });

    this.redisSub.on("error", (err) => {
      logger.error({ err }, "redis_sub_error");
    });

    logger.info("redis_subscriber_ready");
  }

  private forwardToRoom(roomId: string, rawMessage: string): void {
    const userIds = this.rooms.get(roomId);
    if (!userIds) return;
    for (const userId of userIds) {
      const userSockets = this.sockets.get(userId);
      if (userSockets) {
        for (const ws of userSockets) {
          if (ws.readyState === ws.OPEN) ws.send(rawMessage);
        }
      }
    }
  }

  async refreshPresence(userId: string): Promise<void> {
    await this.redisPub.set(`presence:${userId}`, "online", "EX", 35);
  }

  async isOnline(userId: string): Promise<boolean> {
    const result = await this.redisPub.exists(`presence:${userId}`);
    return result === 1;
  }

  getUserInfo(userId: string): { name: string; avatarUrl: string | null } | undefined {
    return this.userInfo.get(userId);
  }
}

export const roomManager = new RoomManager();
