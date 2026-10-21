
import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { getDB } from "../db";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const google = new OAuth2Client();

router.post("/google", async (req, res) => {
  const token = req.body?.credential;

  if (typeof token !== "string") {
    res.status(400).json({ error: "Missing Google credential" });
    return;
  }

  try {
    // Verify the Google identity token
    const ticket = await google.verifyIdToken({
      idToken: token,
      audience: process.env.BUN_PUBLIC_GOOGLE_CLIENT_ID
    });

    const profile = ticket.getPayload();

    if (!profile?.sub || !profile.email || !profile.email_verified) {
      res.status(401).json({ error: "Invalid Google account" });
      return;
    }

    // Find the user in MongoDB
    const user = await getDB().collection("users").findOne({
      googleId: profile.sub
    });

    res.json({
      message: "Google account verified",
      existingUser: !!user
    });

  } catch {
    res.status(401).json({ error: "Google authentication failed" });
  }
});

export default router;
