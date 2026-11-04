import ProfileNavbar from "@/components/ProfileNavbar";
import type { Itinerary, ItineraryItem } from "backend/models/Itinerary";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import Comments from "./comments";

function isItineraryItem(value: unknown): value is ItineraryItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.description === "string" &&
    typeof item.photoUrl === "string" &&
    typeof item.order === "number"
  );
}

function isItinerary(value: unknown): value is Itinerary {
  if (!value || typeof value !== "object") return false;

  const itinerary = value as Record<string, unknown>;
  return (
    typeof itinerary.id === "string" &&
    typeof itinerary.authorId === "string" &&
    typeof itinerary.title === "string" &&
    typeof itinerary.description === "string" &&
    typeof itinerary.likesCount === "number" &&
    Array.isArray(itinerary.items) &&
    itinerary.items.every(isItineraryItem)
  );
}

export default function ItineraryPage({ id }: { id: string }) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError("");
      setNotFound(false);
      setItinerary(null);

      try {
        const response = await fetch(
          `http://localhost:3001/api/itineraries/${encodeURIComponent(id)}`,
          { credentials: "include", signal: controller.signal },
        );
        const json: unknown = await response.json();

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          const message =
            json &&
            typeof json === "object" &&
            "error" in json &&
            typeof json.error === "string"
              ? json.error
              : "Could not load this itinerary";
          throw new Error(message);
        }

        if (!isItinerary(json)) {
          throw new Error("The server returned invalid itinerary data");
        }

        setItinerary(json);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load this itinerary",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, reloadCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <ProfileNavbar />
        <main
          aria-label="Loading itinerary"
          className="mx-auto w-full max-w-3xl animate-pulse px-4 py-8 sm:px-6 sm:py-12"
        >
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="mt-8 h-9 w-3/5 rounded bg-gray-200" />
          <div className="mt-4 h-4 w-full rounded bg-gray-100" />
          <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />
          <div className="mt-8 h-80 rounded-md border border-gray-200 bg-white shadow-sm" />
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <ProfileNavbar />
        <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="mt-2 text-3xl font-bold text-gray-950">Not found</h1>
          <p className="mt-3 text-gray-500">This post may have been deleted</p>
          <a
            href="/feed"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </a>
        </main>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <ProfileNavbar />
        <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-3xl font-bold text-gray-950">
            Couldn&apos;t load this itinerary
          </h1>
          <p className="mt-3 text-gray-500">
            {error || "Something went wrong. Please try again."}
          </p>
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="mt-6 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Try again
          </button>
        </main>
      </div>
    );
  }

  const stops = [...itinerary.items].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ProfileNavbar />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <a
          href="/feed"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </a>

        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                {itinerary.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                {itinerary.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-900" />
                {stops.length} {stops.length === 1 ? "stop" : "stops"}
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                {itinerary.likesCount}
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-950">
                Itinerary Stops
              </h2>
            </div>

            <ol>
              {stops.map((stop, index) => (
                <li
                  key={stop.id}
                  className="relative flex gap-4 pb-7 last:pb-0"
                >
                  {index < stops.length - 1 && (
                    <div className="absolute top-9 bottom-0 left-4 w-px bg-gray-200" />
                  )}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="font-semibold text-gray-900">{stop.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      {stop.description}
                    </p>
                    {stop.photoUrl && (
                      <img
                        src={stop.photoUrl}
                        alt={stop.name}
                        className="mt-4 aspect-video w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <Comments key={itinerary.id} itineraryId={itinerary.id} />
        </div>
      </main>
    </div>
  );
}
