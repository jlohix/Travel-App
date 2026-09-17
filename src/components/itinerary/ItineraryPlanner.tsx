"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  generateItineraryAction,
  type ItineraryState,
} from "@/app/itinerary/actions";

const INTEREST_OPTIONS = [
  "Food & drink",
  "Scenic areas",
  "Tourist hotspots",
  "History & culture",
  "Nature & outdoors",
  "Nightlife",
  "Shopping",
  "Art & museums",
  "Local experiences",
  "Relaxation",
];

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Generating your itinerary…" : "✨ Generate itinerary"}
    </button>
  );
}

export function ItineraryPlanner({ configured }: { configured: boolean }) {
  const [state, formAction] = useFormState<ItineraryState, FormData>(
    generateItineraryAction,
    undefined
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Form */}
      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"
      >
        {!configured && (
          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No <code>GEMINI_API_KEY</code> set. Add it to <code>.env</code> and
            restart to enable generation.
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Destination(s)
          </label>
          <input
            name="destinations"
            required
            placeholder="Tokyo, Kyoto"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">
            Separate multiple places with commas.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Days</label>
          <input
            name="days"
            type="number"
            min={1}
            max={14}
            defaultValue={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Interests</label>
          <div className="grid grid-cols-2 gap-1.5">
            {INTEREST_OPTIONS.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  name="interests"
                  value={opt}
                  className="accent-brand-600"
                />
                {opt}
              </label>
            ))}
          </div>
          <input
            name="customInterest"
            placeholder="Other interest (optional)"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Pace</label>
          <select
            name="pace"
            defaultValue="balanced"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          >
            <option value="relaxed">Relaxed</option>
            <option value="balanced">Balanced</option>
            <option value="packed">Packed</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Notes <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Traveling with kids, vegetarian, on a budget…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <GenerateButton />
      </form>

      {/* Result */}
      <div className="lg:col-span-3">
        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {state?.itinerary ? (
          <ItineraryResult itinerary={state.itinerary} />
        ) : (
          !state?.error && (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
              Fill out the form and generate a personalized day-by-day plan.
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ItineraryResult({
  itinerary,
}: {
  itinerary: NonNullable<ItineraryState>["itinerary"];
}) {
  if (!itinerary) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-brand-700">{itinerary.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{itinerary.overview}</p>

      <div className="mt-5 space-y-5">
        {itinerary.days.map((day) => (
          <div key={day.day} className="border-l-2 border-brand-200 pl-4">
            <div className="flex items-baseline gap-2">
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                Day {day.day}
              </span>
              <h3 className="font-semibold">{day.title}</h3>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{day.summary}</p>
            <ul className="mt-2 space-y-2">
              {day.activities.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-slate-400">
                    {a.time}
                  </span>
                  <div>
                    <div className="text-sm font-medium">
                      {a.title}{" "}
                      <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                        {a.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {itinerary.tips?.length > 0 && (
        <div className="mt-6 rounded-lg bg-brand-50 p-4">
          <h4 className="mb-1 text-sm font-semibold text-brand-700">
            Travel tips
          </h4>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-slate-600">
            {itinerary.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
