import express, { type Express, type Request, type Response } from "express";
import usersRouter from "./routes/users";
import authRouter from "./routes/auth";

const app: Express = express();
const port = 3001;
const frontendOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use((req, res, next) => {
  const origin = req.get("origin");

  if (origin && frontendOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json());
app.use("/api/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/users", usersRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
