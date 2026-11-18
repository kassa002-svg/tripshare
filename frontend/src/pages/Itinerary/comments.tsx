import { Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { type Comment } from "backend/models/Comment";
import { API_BASE } from "@/apiBase";
import { useSession } from "@/Session";

interface CommentBoxProps {
  onSubmit: (text: string) => Promise<void>;
  disabled?: boolean;
}

export function CommentBox({ onSubmit, disabled = false }: CommentBoxProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const comment = text.trim();
    if (!comment) return;

    try {
      await onSubmit(comment);
      setText("");
    } catch {

    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5">
      <label htmlFor="new-comment" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="new-comment"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        className="min-h-24 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          Comment
        </button>
      </div>
    </form>
  );
}

type DisplayComment = Comment & { username?: string };

export function CommentView({ comment }: { comment: DisplayComment }) {
  const createdAt = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(comment.createdAt));

  return (
    <article className="flex gap-3 border-t border-gray-100 py-5 first:border-0 first:pt-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
        :)
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-sm font-semibold text-gray-900">
            {comment.username || comment.authorId}
          </p>
          <time className="text-xs text-gray-400" dateTime={comment.createdAt}>
            {createdAt}
          </time>
        </div>
        <p className="mt-1 text-sm leading-6 text-gray-600">{comment.text}</p>
      </div>
    </article>
  );
}

export default function Comments({ itineraryId }: { itineraryId: string }) {
  const { user } = useSession();
  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/itineraries/${encodeURIComponent(itineraryId)}/comments`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!response.ok) throw new Error("Could not load comments");
        if (!Array.isArray(body)) throw new Error("Invalid comments response");
        setComments(body as DisplayComment[]);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Could not load comments");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [itineraryId]);

  const addComment = async (text: string) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/api/itineraries/${encodeURIComponent(itineraryId)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "Could not post comment";
        throw new Error(message);
      }
      setComments((current) => [...current, body as DisplayComment]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not post comment");
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="comments" className="rounded-md border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-950">Comments</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tips and questions from the community
        </p>
      </div>

      {user ? <CommentBox onSubmit={addComment} disabled={submitting} /> : <p className="mt-5 text-sm text-gray-500">Sign in to leave a comment.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {submitting && <p className="mt-3 text-sm text-gray-500">Posting...</p>}

      <div className="mt-6">
        {loading ? <p className="py-6 text-center text-sm text-gray-500">Loading...</p> : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentView key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="py-6 text-center text-sm text-gray-500">
            No comments yet. Start the conversation.
          </p>
        )}
      </div>
    </section>
  );
}
