import { createApp } from "./app";
import { env } from "./lib/env";
import { logger } from "./lib/logger";

const app = createApp();

if (process.env.NODE_ENV !== "test") {
  app.listen(env.SERVER_PORT, () => {
    logger.info(`Server running on port ${env.SERVER_PORT}`);
  });
}

export { app };
