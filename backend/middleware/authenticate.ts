import type { NextFunction, Request, Response } from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  next();
}
