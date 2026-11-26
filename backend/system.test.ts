import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { User } from "./models/User";
import type { Itinerary } from "./models/Itinerary";
import type { Comment } from "./models/Comment";
import { createApp } from "./index";
import { InMemoryDatabase } from "./testHelpers";

const user: User = { id: "author-1", role: "user", passwordHash: "hidden", googleId: null, email: "author@example.com", displayName: "Trip Author", avatar: null, bio: "", following: [], savedItineraries: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" };
const itinerary: Itinerary = { id: "trip-1", authorId: user.id, title: "Weekend in SF", description: "A short trip", items: [], likes: [], likesCount: 0, copiedFrom: null, createdAt: "2026-01-01", updatedAt: "2026-01-01" };
const comment: Comment = { id: "comment-1", itineraryId: itinerary.id, itemId: null, authorId: user.id, username: "", text: "Loved this trip", createdAt: "2026-01-02", updatedAt: "2026-01-02" };

let memory: InMemoryDatabase;
let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
let baseUrl: string;

beforeEach(async () => {
  memory = new InMemoryDatabase({ users: [user], itineraries: [itinerary], comments: [comment] });
  memory.connect();
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  memory.disconnect();
});

async function json(path: string, method = "GET", body?: unknown, cookie?: string) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, data: await response.json().catch(() => null) as any };
}

describe("backend system integration", () => {
  test("covers CRUD routes and the registration, login, session, and logout flow", async () => {
    const anonymousMe = await json("/api/auth/me");
    expect(anonymousMe.data).toEqual({ user: null });

    const registration = await json("/api/users/register", "POST", { email: "new@example.com", displayName: "New Traveler", password: "secret123" });
    expect(registration.response.status).toBe(201);
    expect(registration.data).toMatchObject({ email: "new@example.com", displayName: "New Traveler" });
    expect(registration.data).not.toHaveProperty("passwordHash");
    const newUserId = registration.data.id as string;

    const publicUser = await json(`/api/users/${newUserId}`);
    expect(publicUser.response.status).toBe(200);
    expect(publicUser.data).not.toHaveProperty("passwordHash");

    const login = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "new@example.com", password: "secret123" }) });
    expect(login.status).toBe(200);
    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const authenticatedMe = await json("/api/auth/me", "GET", undefined, cookie);
    expect(authenticatedMe.data.user.id).toBe(newUserId);

    const profile = await json("/api/users/me", "PATCH", { displayName: "New Name", bio: "A short bio" }, cookie);
    expect(profile.response.status).toBe(200);
    expect(profile.data.user).toMatchObject({ id: newUserId, displayName: "New Name", bio: "A short bio" });

    const allItineraries = await json("/api/itineraries");
    expect(allItineraries.response.status).toBe(200);
    expect(allItineraries.data.map((trip: Itinerary) => trip.id)).toContain(itinerary.id);
    const nearby = await json("/api/itineraries/nearby?north=38&south=36&east=-121&west=-123");
    expect(nearby.response.status).toBe(200);
    const owned = await json("/api/itineraries/owned", "GET", undefined, cookie);
    expect(owned.data).toEqual([]);

    const trip = await json("/api/itineraries", "POST", {
      title: "New York weekend", description: "Three stops", items: [{ name: "Cafe", placeId: "place-1", address: "NYC", location: { lat: 40.7, lng: -74 }, category: "food" }],
    }, cookie);
    expect(trip.response.status).toBe(201);
    const tripId = trip.data.id as string;
    const createdTrip = await json(`/api/itineraries/${tripId}`);
    expect(createdTrip.data).toMatchObject({ title: "New York weekend", authorId: newUserId, items: [{ name: "Cafe", location: { type: "Point", coordinates: [-74, 40.7] } }] });

    const patchedTrip = await json(`/api/itineraries/${tripId}`, "PATCH", { title: "Updated weekend" }, cookie);
    expect(patchedTrip.data.title).toBe("Updated weekend");
    const liked = await json(`/api/itineraries/${tripId}/likes`, "PATCH", {}, cookie);
    expect(liked.data).toMatchObject({ liked: true, likes: [newUserId], likesCount: 1 });

    const postedComment = await json(`/api/itineraries/${tripId}/comments`, "POST", { text: "Great cafe" }, cookie);
    expect(postedComment.response.status).toBe(201);
    expect(postedComment.data).toMatchObject({ itineraryId: tripId, authorId: newUserId, username: "New Name", text: "Great cafe" });
    const comments = await json(`/api/itineraries/${tripId}/comments`);
    expect(comments.data).toHaveLength(1);
    expect((await json(`/api/itineraries/${tripId}/comments/count`)).data).toEqual({ count: 1 });

    const deletedTrip = await fetch(`${baseUrl}/api/itineraries/${tripId}`, { method: "DELETE", headers: { cookie: cookie! } });
    expect(deletedTrip.status).toBe(204);
    expect((await json(`/api/itineraries/${tripId}`)).response.status).toBe(404);

    const logout = await json("/api/auth/logout", "POST", {}, cookie);
    expect(logout.response.status).toBe(200);
    const protectedAfterLogout = await json("/api/itineraries/owned", "GET", undefined, cookie);
    expect(protectedAfterLogout.response.status).toBe(401);
  });
});
