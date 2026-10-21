import { Router, type NextFunction, type Request, type Response } from "express";
import { body, matchedData, validationResult } from "express-validator";
import type { HydratedDocument } from "mongoose";
import { User, type IUser } from "../models/User";

const router = Router();

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatar: string | null;
  bio: string;
  createdAt: Date;
}

function toPublicUser(user: HydratedDocument<IUser>): PublicUser {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

function isDuplicateKeyError(
  err: unknown,
): err is { code: number; keyPattern?: Record<string, number> } {
  return typeof err === "object" && err !== null && "code" in err && err.code === 11000;
}

function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.type === "field" ? e.path : null,
      message: String(e.msg),
    }));
    res.status(400).json({ error: errors[0]?.message, errors });
    return;
  }
  next();
}

const registrationValidation = [
  body("username")
    .isString()
    .withMessage("Username is required")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .isString()
    .withMessage("Valid email is required")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .toLowerCase(),
  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

router.post("/register", registrationValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { username, email, password } = matchedData(req) as RegisterBody;

    try {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        const field = existingUser.email === email ? "email" : "username";
        res.status(409).json({ error: `That ${field} is already taken.` });
        return;
      }

      const passwordHash = await Bun.password.hash(password);
      const user = await User.create({ username, email, passwordHash });

      res.status(201).json({ message: "Account created!", user: toPublicUser(user) });
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        const field = Object.keys(err.keyPattern ?? {})[0] ?? "username or email";
        res.status(409).json({ error: `That ${field} is already taken.` });
        return;
      }
      console.error("Register error:", err);
      res.status(500).json({ error: "Server error during registration" });
    }
  },
);

const loginValidation = [
  body("email")
    .isString()
    .withMessage("Valid email is required")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .toLowerCase(),
  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .notEmpty()
    .withMessage("Password is required"),
];

interface LoginBody {
  email: string;
  password: string;
}

router.post("/login", loginValidation, handleValidationErrors, async (req: Request, res: Response) => {
    const { email, password } = matchedData(req) as LoginBody;

    try {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const passwordMatches = await Bun.password.verify(password, user.passwordHash);
      if (!passwordMatches) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      if (user.banned) {
        res.status(403).json({ error: "This account has been banned" });
        return;
      }

      res.json({ message: `Welcome back, ${user.username}!`, user: toPublicUser(user) });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Server error during login" });
    }
  },
);

export default router;