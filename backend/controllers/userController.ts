import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { updateUserProfile } from "../db";
import type { User } from "../models/User";
import { createHash } from "node:crypto";

async function uploadAvatar(photo: string) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary isnt setup.");
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const formats = "jpg,jpeg,png,webp";
  const signature = createHash("sha256")
    .update(`allowed_formats=${formats}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest("hex");

  const form = new FormData();
  form.set("file", photo);
  form.set("allowed_formats", formats);
  form.set("timestamp", timestamp);
  form.set("api_key", CLOUDINARY_API_KEY);
  form.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`,
    { method: "POST", body: form, signal: AbortSignal.timeout(15_000) },
  );
  if (!response.ok) throw new Error("Couldn't upload photo");

  const result = await response.json() as { secure_url?: string };
  if (!result.secure_url) throw new Error("Photo URL missing");
  return result.secure_url;
}

export async function updateProfile(req: Request, res: Response) {

  let fields = req.body;
  if (req.is("multipart/form-data")) {
    try {
      const form = await new Response(req.body, {
        headers: { "Content-Type": req.get("Content-Type")! },
      }).formData();
      fields = Object.fromEntries(form);
    } catch {
      res.status(400).json({ error: "Could not read your profile photo" });
      return;
    }
  }


  const displayName = req.body?.displayName;
  const bio = req.body?.bio;
  const password = req.body?.password;
  const avatar = req.body?.avatar;
  const photo = req.body?.photo;


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
      avatar?: string;
  } = {
    displayName: displayName.trim(),
    bio: bio.trim(),
    updatedAt: new Date().toISOString(),
  };

    if (photo !== undefined) {
    if (typeof photo !== "string" || !/^data:image\/(jpeg|png|webp);base64,/.test(photo)) {
      res.status(400).json({ error: "Choose a JPG, PNG, or WebP photo" });
      return;
    }
    const encodedPhoto = photo.slice(photo.indexOf(",") + 1);
    const photoBytes = Buffer.from(encodedPhoto, "base64");

    const maxPhotoSize = 4 * 1024 * 1024;
    if (photoBytes.length === 0 || photoBytes.length > maxPhotoSize) {
      res.status(400).json({ error: "Choose a photo up to 4 MB" });
      return;
    }

    if (photoBytes.toString("base64") !== encodedPhoto) {
      res.status(400).json({ error: "Could not read the profile photo" });
      return;
    }

    try {
      updates.avatar = await uploadAvatar(photo);
    } catch {
      res.status(502).json({ error: "Could not upload your photo" });
      return;
    }
  } else if (avatar === "") {
    updates.avatar = "";
  }


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
