import Link from "next/link";
import { requireUser } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await requireUser();

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { recipientId: user.id }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, username: true } },
      recipient: { select: { id: true, username: true } },
    },
  });

  // Group into conversations by the "other" user, keeping the latest message.
  const convos = new Map<
    string,
    {
      username: string;
      lastBody: string;
      lastAt: Date;
      unread: number;
      fromMe: boolean;
    }
  >();

  for (const m of messages) {
    const other = m.senderId === user.id ? m.recipient : m.sender;
    const existing = convos.get(other.username);
    const isUnread = m.recipientId === user.id && !m.read;
    if (!existing) {
      convos.set(other.username, {
        username: other.username,
        lastBody: m.body,
        lastAt: m.createdAt,
        unread: isUnread ? 1 : 0,
        fromMe: m.senderId === user.id,
      });
    } else if (isUnread) {
      existing.unread += 1;
    }
  }

  const conversations = Array.from(convos.values());

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Link
          href="/messages/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New message
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No conversations yet. Start one from a forum post or{" "}
          <Link href="/messages/new" className="font-medium text-brand-600 hover:underline">
            message someone
          </Link>
          .
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {conversations.map((c) => (
            <li key={c.username}>
              <Link
                href={`/messages/${c.username}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {c.username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">@{c.username}</span>
                    <span className="text-xs text-slate-400">
                      {c.lastAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {c.fromMe ? "You: " : ""}
                    {c.lastBody}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
