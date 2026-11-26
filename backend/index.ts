import express, { type Express, type Request, type Response } from "express";
import session from "express-session";
import usersRouter from "./routes/users";
import authRouter from "./routes/auth";
import itinerariesRouter from "./routes/itineraries";
import { connectDB, DatabaseError } from "./db";
import { ensureItineraryIndexes } from "./setupItineraries";

const port = 3001;
const frontendOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

export function createApp(): Express {
  const app: Express = express();
  app.use((req, res, next) => {
    const origin = req.get("origin");

    if (origin && frontendOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.sendStatus(204);
      return;
    }

    next();
  });
  const jsonParser = express.json();
  app.use((req, res, next) => {
    if (req.method === "PATCH" && req.path === "/api/users/me") {
      next();
      return;
    }

    jsonParser(req, res, next);
  });
  app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  }));
  app.use("/api/auth", authRouter);
  app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
  });
  app.use("/api/users", usersRouter);
  app.use("/api/itineraries", itinerariesRouter);

  app.use((error: unknown, _req: Request, res: Response, _next: (error?: unknown) => void) => {
    if (error instanceof DatabaseError) {
      console.error(error.message, error.cause);
      res.status(500).json({ error: "A database operation failed" });
      return;
    }
    console.error("Request failed:", error);
    res.status(500).json({ error: "Internal server error" });
  });
  return app;
}

if (import.meta.main) {
  try {
    await connectDB();
    await ensureItineraryIndexes();
  } catch (err) {
    console.error("Startup failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  createApp().listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
