import ItineraryCard from "@/components/IteneraryCard";
import { testItineraries } from "./testData";
import { X } from "lucide-react";

export default function FeedPage() {
  return (
    <div className="grid gap-4 max-w-screen-md p-4">
      {testItineraries.map((x, i) => (
        <ItineraryCard itinerary={x} key={i} />
      ))}
    </div>
  );
}
