export interface User {
  id: string;

  role: "user" | "admin";
  passwordHash: string | null;
  googleId: string | null;
  email: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  following: string[];
  savedItineraries: string[];
  createdAt: string;
  updatedAt: string;
}
