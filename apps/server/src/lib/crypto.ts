import crypto from "node:crypto";

export const hashString = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");
