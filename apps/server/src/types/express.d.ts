import type { AuthJwtPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
    }
  }
}

export {};
