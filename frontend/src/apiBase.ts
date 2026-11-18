export const DEV_API_BASE = "http://localhost:3001";

export const API_BASE = import.meta.env?.BUN_PUBLIC_API_BASE || DEV_API_BASE;
