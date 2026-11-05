import ItineraryCard from "@/components/IteneraryCard";
import ProfileNavbar from "@/components/ProfileNavbar";
import type { Itinerary } from "backend/models/Itinerary";
import { useEffect, useState } from "react";

function isItinerary(value: unknown): value is Itinerary {
  if (!value || typeof value !== "object") return false;

  const itinerary = value as Record<string, unknown>;
  return (
    typeof itinerary.id === "string" &&
    typeof itinerary.title === "string" &&
    typeof itinerary.description === "string" &&
    Array.isArray(itinerary.items) &&
    Array.isArray(itinerary.likes) &&
    itinerary.likes.every((userId) => typeof userId === "string") &&
    typeof itinerary.likesCount === "number"
  );
}

export default function FeedPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<Itinerary[]>([]);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("http://localhost:3001/api/itineraries", {
          credentials: "include",
          signal: controller.signal,
        });
        const json: unknown = await response.json();

        if (!response.ok) {
          const message =
            json &&
            typeof json === "object" &&
            "error" in json &&
            typeof json.error === "string"
              ? json.error
              : "Could not load itineraries";
          throw new Error(message);
        }

        if (!Array.isArray(json) || !json.every(isItinerary)) {
          throw new Error("The server returned invalid itinerary data");
        }

        setPosts(json);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load itineraries",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [reloadCount]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ProfileNavbar />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Feed
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Get inspired for your next adventure!
          </p>
        </div>

        {loading && (
          <div aria-label="Loading itineraries" className="grid gap-5">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-md border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="h-5 w-2/5 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-full rounded bg-gray-100" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mt-5 h-20 rounded border-t border-gray-100 bg-gray-50" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-6 text-center"
          >
            <h2 className="font-semibold text-red-900">
              Couldn&apos;t load the feed
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReloadCount((count) => count + 1)}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold text-gray-900">No itineraries yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Be the first to share a trip with the community.
            </p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid gap-5">
            {posts.map((itinerary) => (
              <div
                key={itinerary.id}
                className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ItineraryCard itinerary={itinerary} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
