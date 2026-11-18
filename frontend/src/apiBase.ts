export const DEV_API_BASE = "http://localhost:3001";

export const API_BASE = window?.location?.host == "tripshare-dev.zbrasher.us" ? "https://tripshare-dev.zbrasher.us" : DEV_API_BASE;
