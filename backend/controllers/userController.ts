import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { updateUserProfile } from "../db";

export async function updateProfile(req: Request, res: Response) {
  const displayName = req.body?.displayName;
  const bio = req.body?.bio;
  const password = req.body?.password;

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

  const updates: {
    displayName: string;
    bio: string;
    updatedAt: string;
    passwordHash?: string;
  } = {
    displayName: displayName.trim(),
    bio: bio.trim(),
    updatedAt: new Date().toISOString(),
  };

  if (typeof password === "string" && password.trim() !== "") {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await updateUserProfile(req.session.userId!, updates);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
}
