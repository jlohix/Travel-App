export type PinCategory = "general" | "food" | "hotel" | "sight" | "wishlist";

export const PIN_CATEGORIES: {
  value: PinCategory;
  label: string;
  color: string;
  emoji: string;
}[] = [
  { value: "general", label: "General", color: "#0e9384", emoji: "📍" },
  { value: "food", label: "Food & Drink", color: "#f97316", emoji: "🍜" },
  { value: "hotel", label: "Stay", color: "#8b5cf6", emoji: "🏨" },
  { value: "sight", label: "Sight", color: "#3b82f6", emoji: "🏛️" },
  { value: "wishlist", label: "Wishlist", color: "#ec4899", emoji: "⭐" },
];

export function categoryMeta(value: string) {
  return (
    PIN_CATEGORIES.find((c) => c.value === value) ?? PIN_CATEGORIES[0]
  );
}
