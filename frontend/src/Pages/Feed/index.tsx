import ItineraryCard from "@/components/IteneraryCard";
import ProfileNavbar from "@/components/ProfileNavbar";
import { testItineraries } from "./testData";

export default function FeedPage() {
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

        <div className="grid gap-5">
          {testItineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <ItineraryCard itinerary={itinerary} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
