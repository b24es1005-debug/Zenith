"use client";

import { useEffect, useState } from "react";

type MeetupMapPreviewProps = {
  latitude: number;
  longitude: number;
  title: string;
};

type LeafletModules = {
  MapContainer: typeof import("react-leaflet").MapContainer;
  Marker: typeof import("react-leaflet").Marker;
  TileLayer: typeof import("react-leaflet").TileLayer;
  divIcon: typeof import("leaflet").divIcon;
};

export function MeetupMapPreview({ latitude, longitude, title }: MeetupMapPreviewProps) {
  const [modules, setModules] = useState<LeafletModules | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([import("react-leaflet"), import("leaflet")]).then(([reactLeaflet, leaflet]) => {
      if (!active) {
        return;
      }

      setModules({
        MapContainer: reactLeaflet.MapContainer,
        Marker: reactLeaflet.Marker,
        TileLayer: reactLeaflet.TileLayer,
        divIcon: leaflet.divIcon,
      });
    });

    return () => {
      active = false;
    };
  }, []);

  if (!modules) {
    return <div className="h-full w-full bg-slate-900/60" />;
  }

  const meetupIcon = modules.divIcon({
    className: "",
    html: `<div style="width:1rem;height:1rem;border-radius:9999px;background:linear-gradient(180deg,#67e8f9,#0ea5e9);box-shadow:0 0 0 8px rgba(34,211,238,0.12);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <div className="relative h-72 overflow-hidden rounded-3xl border border-white/10">
      <modules.MapContainer center={[latitude, longitude]} zoom={8} className="h-full w-full" scrollWheelZoom={false} dragging={false} zoomControl={false} attributionControl={false}>
        <modules.TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <modules.Marker position={[latitude, longitude]} icon={meetupIcon} />
      </modules.MapContainer>
      <div className="pointer-events-none absolute mt-3 ml-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs text-white/75">{title}</div>
    </div>
  );
}
