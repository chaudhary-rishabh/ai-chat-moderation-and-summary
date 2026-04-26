import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import xss from "xss-clean";
import { env } from "./lib/env";
import { errorHandler } from "./lib/errors";
import { logger } from "./lib/logger";
import { globalLimiter, slowDown } from "./middleware/rateLimiter";
import { apiRouter } from "./routes";

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      frameguard: { action: "deny" },
      referrerPolicy: { policy: "no-referrer" },
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((v) => v.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(compression());
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }),
  );
  app.use(globalLimiter);
  app.use(slowDown);
  app.use(hpp());
  app.use(xss());

  app.use("/api", apiRouter);
  app.use(errorHandler);

  return app;
};
