import { useSession } from "@/Session";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const itinerariesUrl = "http://localhost:3001/api/itineraries";

interface LikeResponse {
  liked: boolean;
  likes: string[];
  likesCount: number;
}

function isLikeResponse(value: unknown): value is LikeResponse {
  if (!value || typeof value !== "object") return false;

  const response = value as Record<string, unknown>;
  return (
    typeof response.liked === "boolean" &&
    Array.isArray(response.likes) &&
    response.likes.every((userId) => typeof userId === "string") &&
    typeof response.likesCount === "number"
  );
}

export default function LikeButton({
  itineraryId,
  likes,
  likesCount,
  className = "relative",
}: {
  itineraryId: string;
  likes: string[];
  likesCount: number;
  className?: string;
}) {
  const { user, loading: sessionLoading } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likesCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLiked(Boolean(user && likes.includes(user.id)));
    setCount(likesCount);
  }, [likes, likesCount, user]);

  async function toggleLike() {
    setError("");

    if (!user) {
      window.alert("Log in to like itineraries.");
      return;
    }

    const previousLiked = liked;
    const previousCount = count;
    const nextLiked = !liked;

    setLiked(nextLiked);
    setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)));
    setPending(true);

    try {
      const response = await fetch(
        `${itinerariesUrl}/${encodeURIComponent(itineraryId)}/likes`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const json: unknown = await response.json();

      if (!response.ok) {
        const message =
          json &&
          typeof json === "object" &&
          "error" in json &&
          typeof json.error === "string"
            ? json.error
            : "Could not update this like.";
        throw new Error(message);
      }

      if (!isLikeResponse(json)) {
        throw new Error("The server returned invalid like data.");
      }

      setLiked(json.liked);
      setCount(json.likesCount);
    } catch (requestError) {
      setLiked(previousLiked);
      setCount(previousCount);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not update this like.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        aria-label={liked ? "Unlike itinerary" : "Like itinerary"}
        aria-pressed={liked}
        disabled={pending || sessionLoading}
        onClick={toggleLike}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-gray-700 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60"
      >
        <Heart
          className="h-4 w-4 text-rose-500"
          fill={liked ? "currentColor" : "none"}
        />
        <span>{count}</span>
      </button>
      {error && (
        <span
          role="alert"
          className="absolute top-full right-0 z-20 mt-1 w-48 rounded-md bg-gray-950 px-3 py-2 text-xs font-normal text-white shadow-lg"
        >
          {error}
        </span>
      )}
    </div>
  );
}
