"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { LocationSearch, type LocationSearchResult } from "@/components/map/LocationSearch";
import { LocationMarker } from "@/components/map/LocationMarker";
import { LocationInfoCard, type MapLocation } from "@/components/map/LocationInfoCard";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { LightPollutionCard } from "@/components/light-pollution/LightPollutionCard";
import { ZenithScoreCard } from "@/components/zenith-score/ZenithScoreCard";
import { AstronomyCard } from "@/components/astronomy/AstronomyCard";

type SelectedLocation = MapLocation & {
  source: "current location" | "map pin" | "search result";
};

const defaultCenter: [number, number] = [20, 0];

function MapSelectionFocus({ center, bounds }: { center: [number, number]; bounds: [[number, number], [number, number]] | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { animate: true, duration: 0.8, padding: [56, 56] });
      return;
    }

    map.flyTo(center, Math.max(map.getZoom(), 5), { animate: true, duration: 0.8 });
  }, [bounds, center, map]);

  return null;
}

function MapClickHandler({ onSelect }: { onSelect: (position: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

async function reverseGeocode(latitude: number, longitude: number) {
  const response = await fetch(`/api/map/reverse?lat=${latitude}&lng=${longitude}`);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { location: LocationSearchResult | null };
  return payload.location;
}

export default function MapView() {
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [selectedBounds, setSelectedBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(() =>
    typeof navigator !== "undefined" && !navigator.geolocation
      ? "Geolocation is unavailable in this browser."
      : "Use the search bar or click the map to place a pin.",
  );
  const requestIdRef = useRef(0);

  const updateSelection = async (
    position: [number, number],
    source: SelectedLocation["source"],
    fallbackName = "Selected location",
  ) => {
    const requestId = ++requestIdRef.current;
    setCenter(position);
    setSelectedBounds(null);

    if (source === "search result") {
      return;
    }

    setLocationStatus("Resolving location details...");
    const location = await reverseGeocode(position[0], position[1]);

    if (requestId !== requestIdRef.current) {
      return;
    }

    setSelectedLocation({
      latitude: position[0],
      longitude: position[1],
      name: location?.name ?? fallbackName,
      displayName: location?.displayName ?? `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`,
      address: location?.address ?? null,
      source,
    });
    setLocationStatus(location ? "Location details loaded." : "Map pin placed. Reverse geocoding was unavailable.");
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLocating(true);
      setLocationStatus("Detecting your current location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates: [number, number] = [position.coords.latitude, position.coords.longitude];
          const resolvedLocation = await reverseGeocode(coordinates[0], coordinates[1]);

          requestIdRef.current += 1;
          setCenter(coordinates);
          setSelectedLocation({
            latitude: coordinates[0],
            longitude: coordinates[1],
            name: resolvedLocation?.name ?? "Your current location",
            displayName: resolvedLocation?.displayName ?? `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`,
            address: resolvedLocation?.address ?? null,
            source: "current location",
          });
          setLocationStatus("Current location detected.");
          setIsLocating(false);
        },
        () => {
          setLocationStatus("Location permission was denied. You can still search or place a pin manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleSearchSelect = async (location: LocationSearchResult) => {
    requestIdRef.current += 1;
    setCenter([location.latitude, location.longitude]);
    setSelectedBounds(location.boundingBox ?? null);
    setSelectedLocation({
      ...location,
      source: "search result",
    });
    setLocationStatus("Search result selected.");
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is unavailable in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates: [number, number] = [position.coords.latitude, position.coords.longitude];
        const resolvedLocation = await reverseGeocode(coordinates[0], coordinates[1]);

        requestIdRef.current += 1;
        setCenter(coordinates);
        setSelectedBounds(null);
        setSelectedLocation({
          latitude: coordinates[0],
          longitude: coordinates[1],
          name: resolvedLocation?.name ?? "Your current location",
          displayName: resolvedLocation?.displayName ?? `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`,
          address: resolvedLocation?.address ?? null,
          source: "current location",
        });
        setLocationStatus("Current location detected.");
        setIsLocating(false);
      },
      () => {
        setLocationStatus("Location permission was denied. You can still search or place a pin manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleMapSelect = async (position: [number, number]) => {
    await updateSelection(position, "map pin");
  };

  const handleMarkerMove = async (position: [number, number]) => {
    await updateSelection(position, "map pin");
  };

  const mapKey = selectedLocation ? `${selectedLocation.latitude}-${selectedLocation.longitude}-${selectedLocation.name}` : "empty";

  return (
    <div className="relative flex min-h-136 flex-1 overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/40">
      <MapContainer
        center={center}
        zoom={selectedLocation ? 10 : 3}
        className="absolute inset-0 h-full w-full"
        scrollWheelZoom
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapSelectionFocus center={center} bounds={selectedBounds} />
        <MapClickHandler onSelect={handleMapSelect} />
        {selectedLocation ? (
          <LocationMarker
            position={[selectedLocation.latitude, selectedLocation.longitude]}
            title={selectedLocation.name}
            subtitle={selectedLocation.address ?? selectedLocation.displayName}
            onMove={handleMarkerMove}
          />
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-500 p-4 sm:p-5">
        <div className="pointer-events-auto grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <LocationSearch
            onSelect={handleSearchSelect}
            onUseCurrentLocation={handleCurrentLocation}
            isLocating={isLocating}
            locationStatus={locationStatus}
          />
          <div className="space-y-4 xl:sticky xl:top-5 xl:max-h-[calc(100vh-8rem)] xl:overflow-auto xl:pr-1">
            <LocationInfoCard key={mapKey} location={selectedLocation} />
            <WeatherCard key={`${mapKey}-weather`} location={selectedLocation} />
            <LightPollutionCard key={`${mapKey}-light-pollution`} location={selectedLocation} />
            <ZenithScoreCard key={`${mapKey}-zenith-score`} location={selectedLocation} />
            <AstronomyCard key={`${mapKey}-astronomy`} location={selectedLocation} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-500 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-xs text-white/60 shadow-xl shadow-black/30 backdrop-blur-xl">
        Tip: drag the pin to fine-tune a saved stargazing location.
      </div>
    </div>
  );
}