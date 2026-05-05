import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

const retryStrategy = (times: number): number | void => {
  if (times > 30) return;
  return Math.min(times * 200, 5000);
};

const sharedOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy,
};

export const redis = new Redis(env.REDIS_URL, sharedOptions);

export const bullmqRedis = new Redis(env.REDIS_URL, sharedOptions);

redis.on("error", (err) => {
  logger.error({ err }, "redis_connection_error");
});

bullmqRedis.on("error", (err) => {
  logger.error({ err }, "bullmq_redis_connection_error");
});
