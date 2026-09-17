"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { sendMessageAction, type MessageState } from "@/app/messages/actions";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

export function MessageComposer({ recipient }: { recipient: string }) {
  const [state, formAction] = useFormState<MessageState, FormData>(
    sendMessageAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="recipient" value={recipient} />
      {state?.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <div className="flex gap-2">
        <input
          name="body"
          required
          autoComplete="off"
          placeholder={`Message @${recipient}…`}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <SendButton />
      </div>
    </form>
  );
}
