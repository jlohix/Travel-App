import { requireUser } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { MapView } from "@/components/map/MapView";
import { PIN_CATEGORIES } from "@/components/map/pin-meta";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const user = await requireUser();

  const pins = await prisma.pin.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your map</h1>
          <p className="text-sm text-slate-500">
            {pins.length} pin{pins.length === 1 ? "" : "s"} saved · click the map to add more
          </p>
        </div>
        <div className="hidden gap-3 sm:flex">
          {PIN_CATEGORIES.map((c) => (
            <div key={c.value} className="flex items-center gap-1 text-xs text-slate-500">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: c.color }}
              />
              {c.label}
            </div>
          ))}
        </div>
      </div>

      <MapView
        pins={pins.map((p) => ({
          id: p.id,
          title: p.title,
          note: p.note,
          lat: p.lat,
          lng: p.lng,
          category: p.category,
          userId: p.userId,
        }))}
        currentUserId={user.id}
      />
    </div>
  );
}
