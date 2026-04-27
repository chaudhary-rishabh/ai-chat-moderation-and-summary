// Lazy-loaded queue registry. Workers and producers share the same queues.
// Created as a separate file to avoid circular dependencies between ws/ and jobs/.
import type { Queue } from "bullmq";
import { redis } from "../lib/redis";

const queues = new Map<string, Queue>();

export const getQueue = (name: string): Queue | undefined => {
  return queues.get(name);
};

export const setQueue = (name: string, queue: Queue): void => {
  queues.set(name, queue);
};
