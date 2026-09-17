"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { createPostAction, type PostFormState } from "@/app/forum/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Posting…" : "Publish post"}
    </button>
  );
}

export function NewPostForm() {
  const [state, formAction] = useFormState<PostFormState, FormData>(
    createPostAction,
    undefined
  );
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          placeholder="Best ramen in Shinjuku?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Body</label>
        <textarea
          name="body"
          required
          rows={5}
          placeholder="Share the details…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <input
            name="country"
            placeholder="Japan"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Region / County</label>
          <input
            name="region"
            placeholder="Tokyo"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <input
            name="city"
            placeholder="Tokyo"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Image <span className="font-normal text-slate-400">(optional, max 5MB)</span>
        </label>
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="mt-2 max-h-48 rounded-lg border border-slate-200 object-cover"
          />
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
