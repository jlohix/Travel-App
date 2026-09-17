import Link from "next/link";
import { requireUser } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewMessagePage() {
  const user = await requireUser();

  const users = await prisma.user.findMany({
    where: { id: { not: user.id } },
    select: { username: true, bio: true },
    orderBy: { username: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/messages" className="text-sm text-slate-500 hover:underline">
        ← Back to messages
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Start a conversation</h1>

      {users.length === 0 ? (
        <p className="text-slate-500">No other users yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {users.map((u) => (
            <li key={u.username}>
              <Link
                href={`/messages/${u.username}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {u.username[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">@{u.username}</div>
                  {u.bio && <div className="text-sm text-slate-400">{u.bio}</div>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
