import rateLimit from "express-rate-limit";
import slowDownMiddleware from "express-slow-down";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../lib/redis";

const createStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => {
      const [command, ...rest] = args;
      return redis.call(command!, ...rest) as Promise<any>;
    },
    prefix,
  });

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("rl:global:"),
  message: { error: "Too many requests, please try again later", code: "RATE_LIMITED" },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("rl:auth:"),
  message: { error: "Too many auth attempts, please try again later", code: "AUTH_RATE_LIMITED" },
});

export const slowDown = slowDownMiddleware({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 500,
  store: createStore("rl:slow:"),
});
