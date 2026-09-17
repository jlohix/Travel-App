"use client";

import { useState, useTransition } from "react";
import { voteAction } from "@/app/forum/actions";

export function VoteButtons({
  postId,
  initialScore,
  initialVote,
}: {
  postId: string;
  initialScore: number;
  initialVote: 0 | 1 | -1;
}) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<0 | 1 | -1>(initialVote);
  const [pending, startTransition] = useTransition();

  function cast(value: 1 | -1) {
    // optimistic
    const wasSame = myVote === value;
    const nextVote = wasSame ? 0 : value;
    setMyVote(nextVote as 0 | 1 | -1);
    startTransition(async () => {
      const res = await voteAction(postId, value);
      if (res && "score" in res && typeof res.score === "number") {
        setScore(res.score);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-0.5 text-slate-500">
      <button
        aria-label="Upvote"
        onClick={() => cast(1)}
        disabled={pending}
        className={`rounded p-1 transition hover:bg-slate-100 ${
          myVote === 1 ? "text-brand-600" : ""
        }`}
      >
        ▲
      </button>
      <span
        className={`text-sm font-semibold ${
          myVote === 1
            ? "text-brand-600"
            : myVote === -1
            ? "text-red-500"
            : "text-slate-700"
        }`}
      >
        {score}
      </span>
      <button
        aria-label="Downvote"
        onClick={() => cast(-1)}
        disabled={pending}
        className={`rounded p-1 transition hover:bg-slate-100 ${
          myVote === -1 ? "text-red-500" : ""
        }`}
      >
        ▼
      </button>
    </div>
  );
}
