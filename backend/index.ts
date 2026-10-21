import express, { type Express, type Request, type Response } from "express";
import usersRouter from "./routes/users";

const app: Express = express();
const port = 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/users", usersRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
