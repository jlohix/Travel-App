"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export type PostFormState = { error?: string } | undefined;

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in to post." };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const country = String(formData.get("country") || "").trim() || null;
  const region = String(formData.get("region") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;

  if (!title) return { error: "Title is required." };
  if (!body) return { error: "Body is required." };

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveImage(formData.get("image") as File | null);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }

  const post = await prisma.post.create({
    data: {
      title,
      body,
      country,
      region,
      city,
      imageUrl,
      authorId: user.id,
    },
  });

  revalidatePath("/forum");
  redirect(`/forum/${post.id}`);
}

export async function addCommentAction(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in to comment." };

  const postId = String(formData.get("postId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Comment cannot be empty." };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found." };

  await prisma.comment.create({
    data: { postId, body, authorId: user.id },
  });

  revalidatePath(`/forum/${postId}`);
  return undefined;
}

/**
 * Toggle a vote on a post. value is 1 (up) or -1 (down).
 * Clicking the same direction again removes the vote.
 */
export async function voteAction(postId: string, value: 1 | -1) {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in to vote." };

  const existing = await prisma.vote.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.vote.delete({ where: { id: existing.id } });
    } else {
      await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
    }
  } else {
    await prisma.vote.create({ data: { postId, userId: user.id, value } });
  }

  const agg = await prisma.vote.aggregate({
    where: { postId },
    _sum: { value: true },
  });

  revalidatePath("/forum");
  revalidatePath(`/forum/${postId}`);
  return { score: agg._sum.value ?? 0 };
}
