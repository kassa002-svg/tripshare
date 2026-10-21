import { Schema, model, type Types } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  passwordHash?: string; 
  role: "user" | "admin";
  googleId: string | null;
  avatar: string | null;
  bio: string;
  banned: boolean;
  // following: Types.ObjectId[]; FUTURE IMPLEMENTATION?
  createdAt: Date; 
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    banned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);
