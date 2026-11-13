import type { Request, Response } from "express";
import { getDB } from "../db";
import type { User } from "../models/User";

export async function updateProfile(req: Request, res: Response) {
  const displayName = req.body?.displayName;
  const bio = req.body?.bio;

  if (typeof displayName !== "string") {
    res.status(400).json({ error: "Enter your name" });
    return;
  }

  if (displayName.trim() === "") {
    res.status(400).json({ error: "Name can't be empty" });
    return;
  }

  if (typeof bio !== "string") {
    res.status(400).json({ error: "Bio needs to be text" });
    return;
  }

  const user = await getDB().collection<User>("users").findOneAndUpdate(
    { id: req.session.userId },
    { $set: {
      displayName: displayName.trim(),
      bio: bio.trim(),
      updatedAt: new Date().toISOString(),
    } },
    { returnDocument: "after", projection: { passwordHash: 0, googleId: 0, _id: 0 } },
  );

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
}
