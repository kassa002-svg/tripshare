import { json, Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { createUser, getPublicUserById } from "../db";
import type { User } from "../models/User";
import { updateProfile } from "../controllers/userController";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.patch("/me", authenticate, json({ limit: "6mb" }), updateProfile);

router.post("/register", async (req: Request, res: Response) => {
  if (typeof req.body.password !== "string") {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);

  const user: User = {
    id: new ObjectId().toHexString(),
    role: "user",
    googleId: null,
    email: typeof req.body.email === "string" ? req.body.email : "",
    displayName: typeof req.body.displayName === "string" ? req.body.displayName : "Traveler",
    avatar: req.body.profilePhotoUrl ?? "",
    bio: req.body.bio ?? "",
    following: [],
    savedItineraries: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordHash,
  };

  await createUser(user);
  res.status(201).json({ message: "Registration successful" });
});

router.get("/:id", async (req: Request, res: Response) => {
  // testing only...
  const user = await getPublicUserById(String(req.params.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

export default router;
