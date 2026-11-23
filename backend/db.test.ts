import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { User } from "./models/User";
import type { Itinerary } from "./models/Itinerary";
import type { Comment } from "./models/Comment";
import { countComments, createComment, createItinerary, createUser, deleteItinerary, getCommentAuthorNames, getPublicUserById, getUserByEmail, hasItinerary, listComments, listItineraries, listNearbyItineraries, listUserItineraries, setItinerary, toggleItineraryLike, updateUserProfile } from "./db";
import { InMemoryDatabase } from "./testHelpers";

const user: User = { id: "u1", role: "user", passwordHash: "secret", googleId: "g1", email: "u@example.com", displayName: "Uma", avatar: null, bio: "hello", following: [], savedItineraries: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" };
const itinerary = (id: string, authorId = "u1", createdAt = "2026-01-01", longitude = -122, latitude = 37): Itinerary => ({ id, authorId, title: id, description: "trip", items: [{ id: `${id}-item`, itineraryId: id, name: "Cafe", description: "", photoUrl: "", placeId: "p1", address: "SF", location: { type: "Point", coordinates: [longitude, latitude] }, category: null, order: 0, createdAt, updatedAt: createdAt }], likes: [], likesCount: 0, copiedFrom: null, createdAt, updatedAt: createdAt });
const comment = (id: string, itineraryId: string, createdAt: string): Comment => ({ id, itineraryId, itemId: null, authorId: "u1", username: "Uma", text: id, createdAt, updatedAt: createdAt });

let memory: InMemoryDatabase;
beforeEach(() => { memory = new InMemoryDatabase({ users: [user], itineraries: [itinerary("a", "u1", "2026-01-01"), itinerary("b", "u1", "2026-01-03", -121, 38), itinerary("c", "u2", "2026-01-02", -120, 39)], comments: [comment("c1", "a", "2026-01-02"), comment("c2", "a", "2026-01-01")] }); memory.connect(); });
afterEach(() => memory.disconnect());

describe("centralized database queries", () => {
  test("creates and reads users while applying public projections", async () => {
    expect(await getUserByEmail(user.email)).toEqual(user);
    expect(await getPublicUserById(user.id)).not.toHaveProperty("passwordHash");
    expect(await getCommentAuthorNames(["u1", "missing"])).toEqual([{ id: "u1", displayName: "Uma" }]);
    const created = { ...user, id: "u2", email: "two@example.com" };
    await createUser(created);
    expect((await getUserByEmail(created.email))?.id).toBe("u2");
    expect(await updateUserProfile("u1", { displayName: "Uma K", bio: "updated", updatedAt: "2026-02-01" })).toEqual({ id: "u1", role: "user", email: user.email, displayName: "Uma K", avatar: null, bio: "updated", following: [], savedItineraries: [], createdAt: user.createdAt, updatedAt: "2026-02-01" });
  });

  test("lists, filters, replaces and deletes itineraries", async () => {
    expect((await listItineraries()).length).toBe(3);
    expect((await listUserItineraries("u1")).map(({ id }) => id)).toEqual(["b", "a"]);
    expect((await listNearbyItineraries(37.5, 36.5, -121.5, -122.5)).map(({ id }) => id)).toEqual(["a"]);
    expect(await hasItinerary("a")).toBe(true);
    const replacement = itinerary("a", "u2", "2026-03-01");
    await setItinerary("a", replacement);
    expect((await listUserItineraries("u2")).map(({ id }) => id)).toContain("a");
    expect(await deleteItinerary("a")).toBe(true);
    expect(await deleteItinerary("absent")).toBe(false);
  });

  test("toggles likes and stores comments in chronological order", async () => {
    expect(await toggleItineraryLike("a", "u2")).toEqual({ likes: ["u2"], likesCount: 1 });
    expect(await toggleItineraryLike("a", "u2")).toEqual({ likes: [], likesCount: 0 });
    await createComment(comment("c3", "a", "2026-01-03"));
    expect(await countComments("a")).toBe(3);
    expect((await listComments("a")).map(({ id }) => id)).toEqual(["c2", "c1", "c3"]);
  });
});
