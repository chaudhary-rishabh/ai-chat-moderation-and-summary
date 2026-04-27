import http from "node:http";
import { createApp } from "./app";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { initWsServer } from "./ws";
import { initJobs } from "./jobs";

const app = createApp();
const server = http.createServer(app);

if (process.env.NODE_ENV !== "test") {
  server.listen(env.SERVER_PORT, () => {
    logger.info(`Server running on port ${env.SERVER_PORT}`);
  });
}

initWsServer(server);
initJobs();

export { app };
