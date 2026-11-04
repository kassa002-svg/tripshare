import ProfileNavbar from "@/components/ProfileNavbar";
import {
  ArrowLeft,
  Image,
  LoaderCircle,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, type FormEvent } from "react";

interface DraftStop {
  key: string;
  name: string;
  description: string;
  placeId: string;
  photoUrl: string;
}

const inputClasses =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none";

function newStop(): DraftStop {
  return {
    key: crypto.randomUUID(),
    name: "",
    description: "",
    placeId: "",
    photoUrl: "",
  };
}

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stops, setStops] = useState<DraftStop[]>([newStop()]);
  const [isPosting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateStop = (
    key: string,
    field: keyof Omit<DraftStop, "key">,
    value: string,
  ) => {
    setStops((currentStops) =>
      currentStops.map((stop) =>
        stop.key === key ? { ...stop, [field]: value } : stop,
      ),
    );
  };

  const removeStop = (key: string) => {
    setStops((currentStops) =>
      currentStops.length === 1
        ? currentStops
        : currentStops.filter((stop) => stop.key !== key),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/itineraries", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId:
            window.localStorage.getItem("tripshareUserId") ?? "test-user",
          title,
          description,
          items: stops.map((stop, index) => ({
            name: stop.name,
            description: stop.description,
            placeId: stop.placeId,
            photoUrl: stop.photoUrl,
            order: index,
          })),
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not publish itinerary");
      }

      window.location.href = "/feed";
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not publish itinerary",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ProfileNavbar />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <a
          href="/feed"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </a>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Create an itinerary
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Share the places, descriptions, how you liked travelling somewhere
            so someone else can do it too!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-950">
                Itinerary details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Give people a quick idea of what this trip is about.
              </p>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Title
                </span>
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={inputClasses}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </span>
                <textarea
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={`${inputClasses} min-h-28 resize-y`}
                />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-950">Stops</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add each place in the order it should be visited.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                {stops.length} {stops.length === 1 ? "stop" : "stops"}
              </span>
            </div>

            <div className="space-y-4">
              {stops.map((stop, index) => (
                <fieldset
                  key={stop.key}
                  className="rounded-lg border border-gray-200 bg-gray-50/70 p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <legend className="flex items-center gap-3 font-semibold text-gray-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-sm text-white">
                        {index + 1}
                      </span>
                      Stop {index + 1}
                    </legend>
                    <button
                      type="button"
                      onClick={() => removeStop(stop.key)}
                      disabled={stops.length === 1}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-white hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        Place name
                      </span>
                      <input
                        required
                        value={stop.name}
                        onChange={(event) =>
                          updateStop(stop.key, "name", event.target.value)
                        }
                        className={inputClasses}
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Notes
                      </span>
                      <textarea
                        value={stop.description}
                        onChange={(event) =>
                          updateStop(
                            stop.key,
                            "description",
                            event.target.value,
                          )
                        }
                        className={`${inputClasses} min-h-20 resize-y`}
                      />
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Google Place ID
                      </span>
                      <input
                        required
                        value={stop.placeId}
                        onChange={(event) =>
                          updateStop(stop.key, "placeId", event.target.value)
                        }
                        className={inputClasses}
                      />
                    </label>
                  </div>
                </fieldset>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStops((current) => [...current, newStop()])}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-600"
            >
              <Plus className="h-4 w-4" />
              Add a stop
            </button>
          </section>

          {error && <p className="text-lg text-red-700">{error}</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <a
              href="/feed"
              className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={isPosting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPosting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Post
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
