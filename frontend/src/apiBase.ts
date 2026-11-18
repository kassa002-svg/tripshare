export const DEV_API_BASE = "http://localhost:3001";

// Bun only exposes BUN_PUBLIC_* values to browser code.
export const API_BASE = process.env.BUN_PUBLIC_API_BASE || DEV_API_BASE;
