import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { MessageComposer } from "@/components/messages/MessageComposer";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: { username: string };
}) {
  const user = await requireUser();

  const other = await prisma.user.findUnique({
    where: { username: params.username },
    select: { id: true, username: true, bio: true },
  });
  if (!other) notFound();

  if (other.id === user.id) {
    return (
      <div className="mx-auto max-w-2xl text-center text-slate-500">
        You can’t message yourself.{" "}
        <Link href="/messages" className="text-brand-600 hover:underline">
          Back to messages
        </Link>
      </div>
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, recipientId: other.id },
        { senderId: other.id, recipientId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { senderId: other.id, recipientId: user.id, read: false },
    data: { read: true },
  });

  return (
    <div className="mx-auto flex h-[75vh] max-w-2xl flex-col">
      <div className="mb-3 flex items-center gap-3">
        <Link href="/messages" className="text-sm text-slate-500 hover:underline">
          ←
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
          {other.username[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-semibold">@{other.username}</div>
          {other.bio && <div className="text-xs text-slate-400">{other.bio}</div>}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "rounded-br-sm bg-brand-600 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <div
                    className={`mt-0.5 text-right text-[10px] ${
                      mine ? "text-brand-100" : "text-slate-400"
                    }`}
                  >
                    {m.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3">
        <MessageComposer recipient={other.username} />
      </div>
    </div>
  );
}
