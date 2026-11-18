import type { Itinerary } from "backend/models/Itinerary";
import LikeButton from "./LikeButton";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "@/apiBase";

export default function ItineraryCard({
  itinerary,
  onClick,
}: {
  itinerary: Itinerary;
  onClick?: (id: string) => void;
}) {
  const [commentCount, setCommentCount] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/itineraries/${encodeURIComponent(itinerary.id)}/comments/count`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => response.ok ? response.json() : null)
      .then((result: unknown) => {
        if (result && typeof result === "object" && "count" in result && typeof result.count === "number") {
          setCommentCount(result.count);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [itinerary.id]);

  const [firstItem, secondItem] = [...itinerary.items].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="relative w-full rounded bg-white">
      <a
        href={`/itineraries/${itinerary.id}`}
        className="block cursor-pointer rounded p-5"
      >
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
      </a>
      <LikeButton
        itineraryId={itinerary.id}
        likes={itinerary.likes}
        likesCount={itinerary.likesCount}
        className="absolute right-3 bottom-3 z-10"
      />
      <a
        href={`/itineraries/${itinerary.id}#comments`}
        aria-label={`${commentCount} comments`}
        className="absolute right-16 bottom-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-sm text-gray-600 hover:text-gray-950"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{commentCount}</span>
      </a>
    </div>
  );
}
