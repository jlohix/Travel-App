import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VoteButtons } from "@/components/forum/VoteButtons";
import { CommentForm } from "@/components/forum/CommentForm";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true } },
      votes: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { username: true } } },
      },
    },
  });

  if (!post) notFound();

  const score = post.votes.reduce((s, v) => s + v.value, 0);
  const myVote = user
    ? (post.votes.find((v) => v.userId === user.id)?.value ?? 0)
    : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/forum" className="text-sm text-slate-500 hover:underline">
        ← Back to forum
      </Link>

      <article className="mt-2 flex gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <VoteButtons
          postId={post.id}
          initialScore={score}
          initialVote={myVote as 0 | 1 | -1}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1">
            {[post.city, post.region, post.country]
              .filter(Boolean)
              .map((loc) => (
                <Link
                  key={loc}
                  href={`/forum?${new URLSearchParams(
                    post.city === loc
                      ? { city: loc as string }
                      : post.region === loc
                      ? { region: loc as string }
                      : { country: loc as string }
                  ).toString()}`}
                  className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                >
                  {loc}
                </Link>
              ))}
          </div>
          <h1 className="mt-1 text-2xl font-bold">{post.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>by @{post.author.username}</span>
            <span>·</span>
            <span>{post.createdAt.toLocaleString()}</span>
            {user && user.id !== post.author.id && (
              <>
                <span>·</span>
                <Link
                  href={`/messages/${post.author.username}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  Message @{post.author.username}
                </Link>
              </>
            )}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-slate-700">{post.body}</p>
          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              className="mt-3 max-h-96 rounded-lg border border-slate-100 object-contain"
            />
          )}
        </div>
      </article>

      <section className="mt-6">
        <h2 className="mb-3 font-semibold">
          {post.comments.length} comment{post.comments.length === 1 ? "" : "s"}
        </h2>

        {user ? (
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <div className="mb-5 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Log in
            </Link>{" "}
            to join the conversation.
          </div>
        )}

        <ul className="space-y-3">
          {post.comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-slate-100 bg-white p-4"
            >
              <div className="mb-1 text-xs text-slate-400">
                @{c.author.username} · {c.createdAt.toLocaleString()}
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
