import { requireUser } from "@/lib/require-auth";
import { isGeminiConfigured } from "@/lib/gemini";
import { ItineraryPlanner } from "@/components/itinerary/ItineraryPlanner";

export default async function ItineraryPage() {
  await requireUser();
  const configured = isGeminiConfigured();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">AI itinerary generator</h1>
        <p className="text-sm text-slate-500">
          Tell us where you’re going and what you love — we’ll build a day-by-day
          plan with Gemini.
        </p>
      </div>
      <ItineraryPlanner configured={configured} />
    </div>
  );
}
