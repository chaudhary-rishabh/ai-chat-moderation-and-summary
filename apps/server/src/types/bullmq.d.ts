// Minimal type stubs for bullmq — only the APIs used by our workers.
// This allows tsc to pass when bullmq cannot be installed due to Windows file locking.
// Remove this file once `pnpm add bullmq` succeeds.

declare module "bullmq" {
  export interface QueueOptions {
    connection: any;
  }

  export interface JobsOptions {
    repeat?: { pattern: string };
    removeOnComplete?: boolean | number | { count: number };
    removeOnFail?: boolean | number | { count: number };
  }

  export class Queue<DataType = any, ResultType = any, NameType extends string = string> {
    constructor(name: string, opts?: QueueOptions);
    add(name: NameType, data: DataType, opts?: JobsOptions): Promise<Job<DataType, ResultType, NameType>>;
  }

  export interface Job<DataType = any, ResultType = any, NameType extends string = string> {
    id?: string;
    name: NameType;
    data: DataType;
  }

  export interface WorkerOptions {
    connection: any;
    concurrency?: number;
    removeOnComplete?: boolean | number | { count: number };
    removeOnFail?: boolean | number | { count: number };
  }

  export class Worker<DataType = any, ResultType = any, NameType extends string = string> {
    constructor(
      name: string,
      processor: (job: Job<DataType, ResultType, NameType>) => Promise<ResultType>,
      opts?: WorkerOptions,
    );
    on(event: "failed", callback: (job?: Job<DataType, ResultType, NameType>, err?: Error) => void): void;
    on(event: "completed", callback: (job: Job<DataType, ResultType, NameType>) => void): void;
  }
}
