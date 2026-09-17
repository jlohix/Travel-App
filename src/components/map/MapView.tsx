"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
      Loading map…
    </div>
  ),
});

export function MapView(props: { pins: MapPin[]; currentUserId: string }) {
  return <LeafletMap {...props} />;
}
