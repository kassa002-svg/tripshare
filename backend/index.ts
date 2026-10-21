import express, { type Express, type Request, type Response } from 'express';
import path from "node:path";
import { connectDB } from "./db";
import { User } from "./models/User";
import authRouter from "./routes/auth";

const app: Express = express();
const port: number = Number(process.env.PORT) || 3000;

const distDir: string = path.join(import.meta.dir, "..", "frontend", "dist");
app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ok: true, time: new Date().toISOString()});
})

app.use("/api/auth", authRouter);

app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
});

app.use(express.static(distDir));

app.get("/{*splat}", (req: Request, res: Response) => {
  res.sendFile(path.join(distDir, "index.html"));
});

await connectDB();
await User.init();

app.listen(port, () => {
  console.log(`TripShare server running at http://localhost:${port}`);
});
