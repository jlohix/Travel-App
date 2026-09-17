"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const VALID_CATEGORIES = ["general", "food", "hotel", "sight", "wishlist"];

export async function createPin(input: {
  title: string;
  note?: string;
  lat: number;
  lng: number;
  category: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const title = input.title.trim();
  if (!title) return { error: "Title is required." };
  if (
    typeof input.lat !== "number" ||
    typeof input.lng !== "number" ||
    Number.isNaN(input.lat) ||
    Number.isNaN(input.lng)
  ) {
    return { error: "Invalid coordinates." };
  }

  const category = VALID_CATEGORIES.includes(input.category)
    ? input.category
    : "general";

  const pin = await prisma.pin.create({
    data: {
      title,
      note: input.note?.trim() || null,
      lat: input.lat,
      lng: input.lng,
      category,
      userId: user.id,
    },
  });

  revalidatePath("/map");
  return { pin };
}

export async function deletePin(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  // Only allow deleting your own pin
  const pin = await prisma.pin.findUnique({ where: { id } });
  if (!pin || pin.userId !== user.id) {
    return { error: "Pin not found." };
  }

  await prisma.pin.delete({ where: { id } });
  revalidatePath("/map");
  return { ok: true };
}
