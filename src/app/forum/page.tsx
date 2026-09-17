import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VoteButtons } from "@/components/forum/VoteButtons";

export const dynamic = "force-dynamic";

type SearchParams = {
  country?: string;
  region?: string;
  city?: string;
  q?: string;
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();

  const { country, region, city, q } = searchParams;

  const where: any = {};
  if (country) where.country = country;
  if (region) where.region = region;
  if (city) where.city = city;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { body: { contains: q } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { username: true } },
      votes: true,
      _count: { select: { comments: true } },
    },
  });

  // Distinct location values for filter dropdowns
  const allPosts = await prisma.post.findMany({
    select: { country: true, region: true, city: true },
  });
  const countries = uniq(allPosts.map((p) => p.country));
  const regions = uniq(allPosts.map((p) => p.region));
  const cities = uniq(allPosts.map((p) => p.city));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community forum</h1>
          <p className="text-sm text-slate-500">
            Ask questions and share tips, filtered by destination.
          </p>
        </div>
        <Link
          href="/forum/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + New post
        </Link>
      </div>

      {/* Filters */}
      <form className="mb-5 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search…"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none sm:col-span-2"
        />
        <FilterSelect name="country" value={country} options={countries} label="Country" />
        <FilterSelect name="region" value={region} options={regions} label="Region/County" />
        <FilterSelect name="city" value={city} options={cities} label="City" />
        <div className="flex gap-2 sm:col-span-5">
          <button className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
            Apply filters
          </button>
          {(country || region || city || q) && (
            <Link
              href="/forum"
              className="rounded-md border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-50"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No posts match your filters yet.{" "}
          <Link href="/forum/new" className="font-medium text-brand-600 hover:underline">
            Start the conversation
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => {
            const score = p.votes.reduce((s, v) => s + v.value, 0);
            const myVote = user
              ? (p.votes.find((v) => v.userId === user.id)?.value ?? 0)
              : 0;
            return (
              <li
                key={p.id}
                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300"
              >
                <VoteButtons
                  postId={p.id}
                  initialScore={score}
                  initialVote={myVote as 0 | 1 | -1}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1">
                    {[p.city, p.region, p.country]
                      .filter(Boolean)
                      .map((loc) => (
                        <span
                          key={loc}
                          className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                        >
                          {loc}
                        </span>
                      ))}
                  </div>
                  <Link href={`/forum/${p.id}`} className="mt-1 block">
                    <h3 className="truncate text-lg font-semibold text-slate-900 hover:text-brand-600">
                      {p.title}
                    </h3>
                  </Link>
                  <p className="line-clamp-2 text-sm text-slate-600">{p.body}</p>
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="mt-2 max-h-40 rounded-lg border border-slate-100 object-cover"
                    />
                  )}
                  <div className="mt-2 text-xs text-slate-400">
                    by @{p.author.username} · {p._count.comments} comment
                    {p._count.comments === 1 ? "" : "s"} ·{" "}
                    {p.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function uniq(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

function FilterSelect({
  name,
  value,
  options,
  label,
}: {
  name: string;
  value?: string;
  options: string[];
  label: string;
}) {
  return (
    <select
      name={name}
      defaultValue={value ?? ""}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
    >
      <option value="">{label}: All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
