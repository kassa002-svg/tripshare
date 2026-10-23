import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import { getDB } from "../db";

dotenv.config();

const google = new OAuth2Client();

async function verifyGoogleCredential(token: string): Promise<boolean> {
  const ticket = await google.verifyIdToken({
    idToken: token,
    audience: process.env.BUN_PUBLIC_GOOGLE_CLIENT_ID,
  });

  const profile = ticket.getPayload();

  if (!profile?.sub || !profile.email || !profile.email_verified) {
    throw new Error("Invalid Google account");
  }

  const user = await getDB().collection("users").findOne({
    googleId: profile.sub,
  });

  return !!user;
}

export async function googleAuth(req: Request, res: Response): Promise<void> {
  const token = req.body?.credential;

  if (typeof token !== "string") {
    res.status(400).json({ error: "Missing Google credential" });
    return;
  }

  try {
    const existingUser = await verifyGoogleCredential(token);

    res.json({
      message: "Google account verified",
      existingUser,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid Google account") {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(401).json({ error: "Google authentication failed" });
  }
}
