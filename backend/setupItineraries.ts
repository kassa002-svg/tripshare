import { getDB } from "./db";
import type { Itinerary } from "./models/Itinerary";


export async function ensureItineraryIndexes(): Promise<void> {
  const itineraries = getDB().collection<Itinerary>("itineraries");

  await itineraries.createIndexes([
    { key: { id: 1 }, name: "id_unique", unique: true },
    { key: { authorId: 1, createdAt: -1 }, name: "author_newest" },
    { key: { createdAt: -1 }, name: "newest" },
    { key: { likesCount: -1 }, name: "most_liked" },
    { key: { "items.location": "2dsphere" }, name: "stops_location" },
  ]);

  console.log("Itinerary indexes ready");
}