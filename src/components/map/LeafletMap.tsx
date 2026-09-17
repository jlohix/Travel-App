"use client";

import { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PIN_CATEGORIES, categoryMeta, type PinCategory } from "./pin-meta";
import { createPin, deletePin } from "@/app/map/actions";

export type MapPin = {
  id: string;
  title: string;
  note: string | null;
  lat: number;
  lng: number;
  category: string;
  userId: string;
};

type DraftPin = { lat: number; lng: number };

function coloredIcon(color: string, emoji: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);font-size:14px;">${emoji}</span>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function ClickCatcher({ onClick }: { onClick: (p: DraftPin) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LeafletMap({
  pins,
  currentUserId,
}: {
  pins: MapPin[];
  currentUserId: string;
}) {
  const [localPins, setLocalPins] = useState<MapPin[]>(pins);
  const [draft, setDraft] = useState<DraftPin | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<PinCategory>("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (localPins.length) return [localPins[0].lat, localPins[0].lng];
    return [35.6762, 139.6503]; // Tokyo default
  }, [localPins]);

  async function handleSave() {
    if (!draft) return;
    setError(null);
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    setSaving(true);
    const res = await createPin({
      title,
      note,
      lat: draft.lat,
      lng: draft.lng,
      category,
    });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.pin) {
      setLocalPins((prev) => [...prev, res.pin as MapPin]);
      setDraft(null);
      setTitle("");
      setNote("");
      setCategory("general");
    }
  }

  async function handleDelete(id: string) {
    const res = await deletePin(id);
    if (!res.error) {
      setLocalPins((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={center} zoom={11} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCatcher onClick={setDraft} />

        {localPins.map((p) => {
          const meta = categoryMeta(p.category);
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={coloredIcon(meta.color, meta.emoji)}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 font-semibold">
                    <span>{meta.emoji}</span> {p.title}
                  </div>
                  {p.note && <div className="text-sm text-slate-600">{p.note}</div>}
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {meta.label}
                  </div>
                  {p.userId === currentUserId && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="mt-1 text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete pin
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {draft && (
          <Marker
            position={[draft.lat, draft.lng]}
            icon={coloredIcon("#64748b", "➕")}
          />
        )}
      </MapContainer>

      {/* Draft pin form */}
      {draft && (
        <div className="absolute right-4 top-4 z-[1000] w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <h3 className="font-semibold">New pin</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {draft.lat.toFixed(4)}, {draft.lng.toFixed(4)}
          </p>
          {error && (
            <div className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
              {error}
            </div>
          )}
          <div className="mt-3 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g. Amazing viewpoint)"
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PinCategory)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            >
              {PIN_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save pin"}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      {!draft && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-slate-900/80 px-4 py-1.5 text-sm text-white">
          Click anywhere on the map to drop a pin
        </div>
      )}
    </div>
  );
}
