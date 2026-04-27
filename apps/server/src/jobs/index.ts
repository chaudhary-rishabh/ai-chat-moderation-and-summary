import { logger } from "../lib/logger";
import { initEmbedWorker } from "./embedWorker";
import { initSafetyWorker } from "./safetyWorker";
import { initStoryExpiryWorker } from "./storyExpiryWorker";

export const initJobs = (): void => {
  try {
    initEmbedWorker();
    initSafetyWorker();
    initStoryExpiryWorker();
    logger.info("all_workers_initialized");
  } catch (err) {
    logger.error({ err }, "worker_init_failed");
  }
};
