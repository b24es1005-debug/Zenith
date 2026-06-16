"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";

type MeetupMapPreviewProps = {
  latitude: number;
  longitude: number;
  title: string;
};

const meetupIcon = divIcon({
  className: "",
  html: `<div style="width:1rem;height:1rem;border-radius:9999px;background:linear-gradient(180deg,#67e8f9,#0ea5e9);box-shadow:0 0 0 8px rgba(34,211,238,0.12);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function MeetupMapPreview({ latitude, longitude, title }: MeetupMapPreviewProps) {
  return (
    <div className="h-72 overflow-hidden rounded-3xl border border-white/10">
      <MapContainer center={[latitude, longitude]} zoom={8} className="h-full w-full" scrollWheelZoom={false} dragging={false} zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} icon={meetupIcon} />
      </MapContainer>
      <div className="pointer-events-none absolute mt-3 ml-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs text-white/75">{title}</div>
    </div>
  );
}
