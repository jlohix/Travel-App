import Link from "next/link";
import { requireUser } from "@/lib/require-auth";
import { NewPostForm } from "@/components/forum/NewPostForm";

export default async function NewPostPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/forum" className="text-sm text-slate-500 hover:underline">
        ← Back to forum
      </Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Create a post</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <NewPostForm />
      </div>
    </div>
  );
}
