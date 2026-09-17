"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  generateItinerary,
  type Itinerary,
  type ItineraryRequest,
} from "@/lib/gemini";

export type ItineraryState =
  | { itinerary: Itinerary; error?: undefined }
  | { error: string; itinerary?: undefined }
  | undefined;

const VALID_PACE = ["relaxed", "balanced", "packed"] as const;

export async function generateItineraryAction(
  _prev: ItineraryState,
  formData: FormData
): Promise<ItineraryState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const destinationsRaw = String(formData.get("destinations") || "").trim();
  const days = parseInt(String(formData.get("days") || "3"), 10);
  const interests = formData.getAll("interests").map(String);
  const customInterest = String(formData.get("customInterest") || "").trim();
  const pace = String(formData.get("pace") || "balanced");
  const notes = String(formData.get("notes") || "").trim();

  if (!destinationsRaw) {
    return { error: "Please enter at least one destination." };
  }
  if (Number.isNaN(days) || days < 1 || days > 14) {
    return { error: "Days must be a number between 1 and 14." };
  }

  const destinations = destinationsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allInterests = [...interests];
  if (customInterest) allInterests.push(customInterest);

  const req: ItineraryRequest = {
    destinations,
    days,
    interests: allInterests,
    pace: (VALID_PACE as readonly string[]).includes(pace)
      ? (pace as ItineraryRequest["pace"])
      : "balanced",
    notes: notes || undefined,
  };

  try {
    const itinerary = await generateItinerary(req);
    return { itinerary };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed." };
  }
}
