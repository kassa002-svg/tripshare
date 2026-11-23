import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { createUser, DatabaseError, getUserByEmail, getUserByGoogleId } from "../db";
import type { User } from "../models/User";

dotenv.config();

const google = new OAuth2Client();

export async function login(req: Request, res: Response): Promise<void> {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({ error: "Please enter email and password" });
    return;
  }

  const user = await getUserByEmail(email);

  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid information" });
    return;
  }

  req.session.userId = user.id;

  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ message: "Login successful", user: userWithoutPassword });
}

export async function googleAuth(req: Request, res: Response, next: (error?: unknown) => void): Promise<void> {
  const token = req.body.credential;

  if (!token) {
    res.status(400).json({ error: "Missing Google credential" });
    return;
  }

  try {
    const ticket = await google.verifyIdToken({
      idToken: token,
      audience: process.env.BUN_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const profile = ticket.getPayload();

    if (!profile || !profile.sub || !profile.email || !profile.email_verified) {
      throw new Error("Invalid Google account");
    }

    let user: User | null = await getUserByGoogleId(profile.sub);

    if (user === null) {
      const existingEmail = await getUserByEmail(profile.email);

      if (existingEmail !== null) {
        res.status(409).json({ error: "Email already registered with password" });
        return;
      }

      const newUser: User = {
        id: new ObjectId().toHexString(),
        role: "user",
        passwordHash: null,
        googleId: profile.sub,
        email: profile.email,
        displayName: profile.name || profile.email,
        avatar: profile.picture || "",
        bio: "",
        following: [],
        savedItineraries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createUser(newUser);
      user = newUser;
    }

    req.session.userId = user.id;

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: "Google login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof DatabaseError) {
      next(error);
      return;
    }
    res.status(401).json({ error: "Google authentication failed" });
  }
}
