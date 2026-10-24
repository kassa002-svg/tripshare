import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { getDB } from "../db";
import type { User } from "../models/User";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  if (typeof req.body.password !== "string") {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);

  const user: User = {
    id: new ObjectId().toHexString(),
    role: req.body.role,
    googleId: req.body.googleId,
    email: req.body.email,
    displayName: req.body.displayName,
    avatar: req.body.profilePhotoUrl ?? "",
    bio: req.body.bio ?? "",
    following: [],
    savedItineraries: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordHash,
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
