"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { addCommentAction, type PostFormState } from "@/app/forum/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Posting…" : "Comment"}
    </button>
  );
}

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction] = useFormState<PostFormState, FormData>(
    addCommentAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear textarea after a successful submit (no error returned)
  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      {state?.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Add a comment…"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <SubmitButton />
    </form>
  );
}
