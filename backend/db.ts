import { Db as MongoDatabase, MongoClient } from "mongodb";
const DB_NAME = process.env.DB_NAME || "tripshare";

let client: MongoClient | null = null;
let db: MongoDatabase | null = null;

export async function connectDB(): Promise<void> {
  const uri = process.env.ATLAS_URI || process.env.LOCAL_URI;
  const source = process.env.ATLAS_URI ? "ATLAS_URI" : "LOCAL_URI";

  if (!uri) {
    throw new Error(
      "missing ATLAS_URI (or LOCAL_URI) environment variable. set it in tripshare/.env",
    );
  }

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  db = client.db(DB_NAME);
  await db.command({ ping: 1 });

  console.log(`MongoDB connected (${source}, database: ${db.databaseName})`);
}

export function getDB(): MongoDatabase {
  if (!db) {
    throw new Error("database not connected yet. call connectDB() first (index.ts)");
  }
  return db;
}

process.on("SIGINT", async () => {
  await client?.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});
