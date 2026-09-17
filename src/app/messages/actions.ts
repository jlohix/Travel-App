"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type MessageState = { error?: string } | undefined;

export async function sendMessageAction(
  _prev: MessageState,
  formData: FormData
): Promise<MessageState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const recipientUsername = String(formData.get("recipient") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!body) return { error: "Message cannot be empty." };

  const recipient = await prisma.user.findUnique({
    where: { username: recipientUsername },
  });
  if (!recipient) return { error: "User not found." };
  if (recipient.id === user.id) {
    return { error: "You can't message yourself." };
  }

  await prisma.message.create({
    data: {
      senderId: user.id,
      recipientId: recipient.id,
      body,
    },
  });

  revalidatePath(`/messages/${recipientUsername}`);
  revalidatePath("/messages");
  return undefined;
}
