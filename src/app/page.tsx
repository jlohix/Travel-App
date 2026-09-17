import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    icon: "📍",
    title: "Pin your places",
    desc: "Drop pins on an interactive map for spots you love or want to visit.",
    href: "/map",
  },
  {
    icon: "💬",
    title: "Community forums",
    desc: "Reddit-style discussions you can filter by country, region, and city.",
    href: "/forum",
  },
  {
    icon: "🖼️",
    title: "Share photos",
    desc: "Upload images to your posts and inspire fellow travelers.",
    href: "/forum",
  },
  {
    icon: "✉️",
    title: "Message travelers",
    desc: "Reach out and plan meetups with people you meet in the community.",
    href: "/messages",
  },
  {
    icon: "🤖",
    title: "AI itineraries",
    desc: "Generate a day-by-day plan tailored to your interests with Gemini.",
    href: "/itinerary",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-16 text-center text-white">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Plan smarter. Travel better.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand-50/90">
          Wanderly brings your map, a travel community, and an AI trip planner
          together in one place.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {user ? (
            <Link
              href="/map"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Open your map
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-brand-600">
              {f.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
