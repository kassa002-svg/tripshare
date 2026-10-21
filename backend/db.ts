import mongoose from "mongoose";
const DB_NAME = "tripshare";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || process.env.LOCAL_URI;
  const source = process.env.MONGODB_URI ? "Atlas" : "local";

  if (!uri) {
    console.error(
      "MongoDB connection error: MONGODB_URI (or LOCAL_URI) is not set. " +
        "Check tripshare/.env and the --env-file flag in backend/package.json.",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000, 
    });
    console.log(`MongoDB connected (${source}, database: ${mongoose.connection.name})`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("MongoDB connection error:", message);
    process.exit(1);
  }
}

mongoose.connection.on("error", (err) => {
  console.error("Mongoose runtime error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed due to app termination");
  process.exit(0);
});