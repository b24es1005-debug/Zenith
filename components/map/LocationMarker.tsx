"use client";

import { divIcon } from "leaflet";
import { Marker, Popup } from "react-leaflet";

const locationIcon = divIcon({
  className: "",
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:9999px;background:rgba(34,211,238,0.18);box-shadow:0 0 0 8px rgba(34,211,238,0.08),0 0 28px rgba(34,211,238,0.32);">
      <div style="width:0.85rem;height:0.85rem;border-radius:9999px;background:linear-gradient(180deg,#67e8f9,#0ea5e9);border:2px solid rgba(255,255,255,0.95);"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

type LocationMarkerProps = {
  position: [number, number];
  title: string;
  subtitle: string | null;
  onMove: (position: [number, number]) => void;
};

export function LocationMarker({ position, title, subtitle, onMove }: LocationMarkerProps) {
  return (
    <Marker
      position={position}
      draggable
      icon={locationIcon}
      eventHandlers={{
        dragend(event) {
          const marker = event.target;
          const latLng = marker.getLatLng();
          onMove([latLng.lat, latLng.lng]);
        },
      }}
    >
      <Popup>
        <div className="space-y-1 text-slate-900">
          <div className="font-semibold">{title}</div>
          {subtitle ? <div className="text-sm text-slate-600">{subtitle}</div> : null}
        </div>
      </Popup>
    </Marker>
  );
}