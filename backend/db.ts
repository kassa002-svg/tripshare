import { Db as MongoDatabase, MongoClient } from "mongodb";
import type { User } from "./models/User";
import type { Itinerary, ItineraryItem } from "./models/Itinerary";
import type { Comment } from "./models/Comment";

const DB_NAME = process.env.DB_NAME || "tripshare";
let client: MongoClient | null = null;
let db: MongoDatabase | null = null;

export class DatabaseError extends Error {
  constructor(operation: string, cause: unknown) {
    super(`Database operation failed: ${operation}`, { cause });
    this.name = "DatabaseError";
  }
}

async function runDB<T>(operation: string, action: (database: MongoDatabase) => Promise<T>): Promise<T> {
  try {
    return await action(getDB());
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError(operation, error);
  }
}

export async function connectDB(): Promise<void> {
  const uri = process.env.ATLAS_URI || process.env.LOCAL_URI;
  const source = process.env.ATLAS_URI ? "ATLAS_URI" : "LOCAL_URI";
  if (!uri) throw new Error("missing ATLAS_URI (or LOCAL_URI) environment variable. set it in tripshare/.env");

  const nextClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await nextClient.connect();
    const nextDB = nextClient.db(DB_NAME);
    await nextDB.command({ ping: 1 });
    client = nextClient;
    db = nextDB;
    console.log(`MongoDB connected (${source}, database: ${nextDB.databaseName})`);
  } catch (error) {
    await nextClient.close().catch(() => undefined);
    throw new DatabaseError("connect", error);
  }
}

export function getDB(): MongoDatabase {
  if (!db) throw new Error("database not connected yet. call connectDB() first (index.ts)");
  return db;
}

/** Replace the active database for isolated integration tests. */
export function setDBForTests(database: MongoDatabase | null): void {
  db = database;
}

export async function ensureItineraryIndexes(): Promise<void> {
  await runDB("ensure itinerary indexes", async (database) => {
    await database.collection<Itinerary>("itineraries").createIndexes([
      { key: { id: 1 }, name: "id_unique", unique: true },
      { key: { authorId: 1, createdAt: -1 }, name: "author_newest" },
      { key: { createdAt: -1 }, name: "newest" },
      { key: { likesCount: -1 }, name: "most_liked" },
      { key: { "items.location": "2dsphere" }, name: "stops_location" },
    ]);
  });
  console.log("Itinerary indexes ready");
}

export const getUserById = (id: string): Promise<User | null> => runDB("get user by id", (database) => database.collection<User>("users").findOne({ id }));
export const getUserByEmail = (email: string): Promise<User | null> => runDB("get user by email", (database) => database.collection<User>("users").findOne({ email }));
export const getUserByGoogleId = (googleId: string): Promise<User | null> => runDB("get user by Google id", (database) => database.collection<User>("users").findOne({ googleId }));
export const getPublicUserById = (id: string): Promise<Pick<User, "id" | "displayName" | "avatar" | "bio"> | null> => runDB("get public user", (database) => database.collection<User>("users").findOne({ id }, { projection: { _id: 0, id: 1, displayName: 1, avatar: 1, bio: 1 } }));
export const getCommentAuthorNames = (ids: string[]): Promise<Pick<User, "id" | "displayName">[]> => runDB("get comment authors", (database) => database.collection<User>("users").find({ id: { $in: ids } }, { projection: { _id: 0, id: 1, displayName: 1 } }).toArray());
export const createUser = (user: User): Promise<void> => runDB("create user", async (database) => { await database.collection<User>("users").insertOne(user); });
export const updateUserProfile = (id: string, updates: Pick<User, "displayName" | "bio" | "updatedAt"> & Partial<Pick<User, "passwordHash">>): Promise<Partial<User> | null> => runDB("update user profile", (database) => database.collection<User>("users").findOneAndUpdate({ id }, { $set: updates }, { returnDocument: "after", projection: { passwordHash: 0, googleId: 0, _id: 0 } }));

export const createItinerary = (itinerary: Itinerary): Promise<void> => runDB("create itinerary", async (database) => { await database.collection<Itinerary>("itineraries").insertOne(itinerary); });
export const listItineraries = (): Promise<Itinerary[]> => runDB("list itineraries", (database) => database.collection<Itinerary>("itineraries").find({}).toArray());
export const listNearbyItineraries = (north: number, south: number, east: number, west: number): Promise<Itinerary[]> => runDB("list nearby itineraries", (database) => database.collection<Itinerary>("itineraries").find(
  { "items.location": { $geoWithin: { $geometry: { type: "Polygon", coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]] } } } },
  { projection: { _id: 0 } },
).sort({ createdAt: -1 }).limit(20).toArray());
export const listUserItineraries = (authorId: string): Promise<Itinerary[]> => runDB("list user itineraries", (database) => database.collection<Itinerary>("itineraries").find({ authorId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray());
export const getItineraryById = (id: string): Promise<Itinerary | null> => runDB("get itinerary", (database) => database.collection<Itinerary>("itineraries").findOne({ id }, { projection: { _id: 0 } }));
export const hasItinerary = (id: string): Promise<boolean> => runDB("check itinerary", async (database) => (await database.collection<Itinerary>("itineraries").findOne({ id }, { projection: { _id: 0, id: 1 } })) !== null);
export const setItinerary = (id: string, itinerary: Itinerary): Promise<void> => runDB("replace itinerary", async (database) => { await database.collection<Itinerary>("itineraries").replaceOne({ id }, itinerary); });
export const deleteItinerary = (id: string): Promise<boolean> => runDB("delete itinerary", async (database) => (await database.collection<Itinerary>("itineraries").deleteOne({ id })).deletedCount > 0);
export const toggleItineraryLike = (
  id: string,
  userId: string,
): Promise<Pick<Itinerary, "likes" | "likesCount"> | null> => runDB(
  "toggle itinerary like",
  (database) => database.collection<Itinerary>("itineraries").findOneAndUpdate(
    { id },
    [
      { $set: { likes: { $cond: [
        { $in: [userId, { $ifNull: ["$likes", []] }] },
        { $setDifference: [{ $ifNull: ["$likes", []] }, [userId]] },
        { $setUnion: [{ $ifNull: ["$likes", []] }, [userId]] },
      ] }, updatedAt: new Date().toISOString() } },
      { $set: { likesCount: { $size: "$likes" } } },
    ],
    { projection: { _id: 0, likes: 1, likesCount: 1 }, returnDocument: "after" },
  ),
);

export const countComments = (itineraryId: string): Promise<number> => runDB("count comments", (database) => database.collection<Comment>("comments").countDocuments({ itineraryId }));
export const listComments = (itineraryId: string): Promise<Comment[]> => runDB("list comments", (database) => database.collection<Comment>("comments").find({ itineraryId }, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray());
export const createComment = (comment: Comment): Promise<void> => runDB("create comment", async (database) => { await database.collection<Comment>("comments").insertOne(comment); });

process.on("SIGINT", async () => {
  await client?.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});
