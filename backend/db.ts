import { Db as MongoDatabase, MongoClient } from "mongodb";

let db: MongoDatabase | null = null;

export function getDB() {
  if (db) return db;

  // check configuration
  if (!process.env.ATLAS_URI) {
    throw new Error(
      "missing ATLAS_URI environment variable. set it in .env or the system environment",
    );
  }

  const client = new MongoClient(process.env.ATLAS_URI);

  db = client.db();
  return db;
}
