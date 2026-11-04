import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { type Comment } from "backend/models/Comment";

interface CommentBoxProps {
  onSubmit: (text: string) => void;
}

export function CommentBox({ onSubmit }: CommentBoxProps) {
  const [text, setText] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const comment = text.trim();
    if (!comment) return;

    onSubmit(comment);
    setText("");
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
        className="min-h-24 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          Comment
        </button>
      </div>
    </form>
  );
}

export function CommentView({ comment }: { comment: Comment }) {
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
            {comment.authorId}
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

const starterComments: Omit<Comment, "itineraryId">[] = [
  {
    id: "testid1",
    authorId: "grimace shake snake",
    text: "holy stromboli",
    createdAt: "2026-11-03T18:20:00.000Z",
    updatedAt: "2026-11-04T09:20:00.000Z",
    itemId: "1",
  },
  {
    id: "testid2",
    authorId: "helloworld",
    text: "hey mom im in comments",
    createdAt: "2026-11-04T09:15:00.000Z",
    updatedAt: "2026-11-04T09:15:00.000Z",
    itemId: "1",
  },
];

export default function Comments({ itineraryId }: { itineraryId: string }) {
  const [comments, setComments] = useState<Comment[]>(() =>
    starterComments.map((comment) => ({ ...comment, itineraryId })),
  );

  const addComment = (text: string) => {
    const now = new Date().toISOString();

    setComments((currentComments) => [
      ...currentComments,
      {
        id: crypto.randomUUID(),
        itineraryId,
        itemId: null,
        authorId: "test-user",
        text,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  };

  return (
    <section className="rounded-md border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-950">Comments</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tips and questions from the community
        </p>
      </div>

      <CommentBox onSubmit={addComment} />

      <div className="mt-6">
        {comments.length > 0 ? (
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
