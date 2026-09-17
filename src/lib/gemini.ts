import { GoogleGenerativeAI } from "@google/generative-ai";

export type ItineraryRequest = {
  destinations: string[];
  days: number;
  interests: string[];
  pace: "relaxed" | "balanced" | "packed";
  notes?: string;
};

export type ItineraryActivity = {
  time: string;
  title: string;
  description: string;
  category: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  activities: ItineraryActivity[];
};

export type Itinerary = {
  title: string;
  overview: string;
  days: ItineraryDay[];
  tips: string[];
};

/**
 * Candidate models tried in order. The free tier's available model names
 * change over time, so we fall back gracefully. Override with GEMINI_MODEL.
 */
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-pro",
].filter(Boolean) as string[];

function buildPrompt(req: ItineraryRequest): string {
  return `You are an expert travel planner. Create a detailed ${req.days}-day travel itinerary.

Destination(s): ${req.destinations.join(", ")}
Number of days: ${req.days}
Traveler interests: ${req.interests.join(", ") || "general sightseeing"}
Pace: ${req.pace}
${req.notes ? `Additional notes: ${req.notes}` : ""}

Rules:
- Distribute activities across exactly ${req.days} day(s).
- Tailor activities to the stated interests (e.g. food, scenic areas, tourist hotspots, history, nightlife).
- For each activity give a realistic time-of-day label (e.g. "9:00 AM", "Afternoon", "Evening").
- Keep descriptions concise (1-2 sentences) and practical.
- "category" should be one short word like food, sightseeing, nature, culture, shopping, relaxation, nightlife.

Respond ONLY with valid JSON matching exactly this shape (no markdown, no commentary):
{
  "title": "string",
  "overview": "string (2-3 sentences)",
  "days": [
    {
      "day": 1,
      "title": "string",
      "summary": "string (1 sentence)",
      "activities": [
        { "time": "string", "title": "string", "description": "string", "category": "string" }
      ]
    }
  ],
  "tips": ["string", "string", "string"]
}`;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Calls Gemini to generate an itinerary. Throws with a friendly message on failure.
 */
export async function generateItinerary(
  req: ItineraryRequest
): Promise<Itinerary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env file to enable AI itineraries."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(req);

  let lastErr: unknown = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.9,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text) as Itinerary;
      // Minimal shape validation
      if (!parsed.days || !Array.isArray(parsed.days)) {
        throw new Error("Model returned an unexpected shape.");
      }
      return parsed;
    } catch (err) {
      lastErr = err;
      // Try next candidate model on model-not-found style errors.
      continue;
    }
  }

  const msg =
    lastErr instanceof Error ? lastErr.message : "Unknown error from Gemini.";
  throw new Error(`Could not generate itinerary: ${msg}`);
}
