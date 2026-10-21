import { Router, type Request, type Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
import type { User } from "../types";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  // no validation on mvp

  const user: User = {
    id: new ObjectId().toHexString(),
    googleId: req.body.googleId,
    email: req.body.email,
    displayName: req.body.displayName,
    avatar: req.body.profilePhotoUrl ?? "",
    bio: req.body.bio ?? "",
    following: [],
    savedItineraries: [],
    createdAt: new Date().toISOString(),
    passwordHash: "temp",
  };

  await getDB().collection<User>("users").insertOne(user);
  res.status(201).json(user);
});

router.get("/:id", async (req: Request, res: Response) => {
  // testing only...

  const user = await getDB()
    .collection<User>("users")
    .findOne({ id: req.params.id }, { projection: { _id: 0 } });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

export default router;
