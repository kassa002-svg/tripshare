import type { Itinerary } from "backend/models/Itinerary";
import { Heart, MapPin, ArrowUpRight } from "lucide-react";

export default function ItineraryCard({
  itinerary,
  onClick,
}: {
  itinerary: Itinerary;
  onClick?: (id: string) => void;
}) {
  const [firstItem, secondItem] = [...itinerary.items].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <a
      href={`/itinerary/${itinerary.id}`}
      className="relative w-full cursor-pointer rounded bg-white"
    >
      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
          {itinerary.title}
        </h3>

        <p className="mb-4 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-gray-500">
          {itinerary.description}
        </p>

        {firstItem && (
          <div className="relative mb-4 h-[104px] overflow-hidden border-t border-gray-100 pt-3">
            <div className="flex gap-3">
              <div className="text-xl font-semibold text-black">1.</div>
              <div className="min-w-0 pt-0.5">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {firstItem.name}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-gray-500">
                  {firstItem.description}
                </p>
              </div>
            </div>

            {secondItem && (
              <div className="mt-3 flex gap-3 opacity-45">
                <div className="text-xl font-semibold text-black">2.</div>
                <div className="min-w-0 pt-0.5">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {secondItem.name}
                  </p>
                </div>
              </div>
            )}

            {secondItem && (
              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
        )}

        <div className="absolute right-3 bottom-3 flex flex-row items-center gap-1">
          <Heart className="h-4 w-4 text-rose-500" />
          <span className="font-medium text-black">{itinerary.likesCount}</span>
        </div>
      </div>
    </a>
  );
}
