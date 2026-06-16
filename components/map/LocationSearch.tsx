"use client";

import { useEffect, useId, useRef, useState } from "react";

export type LocationSearchResult = {
  name: string;
  displayName: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

type LocationSearchProps = {
  onSelect: (location: LocationSearchResult) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  locationStatus: string | null;
};

export function LocationSearch({ onSelect, onUseCurrentLocation, isLocating, locationStatus }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listId = useId();
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      const resetId = window.setTimeout(() => {
        setResults([]);
        setError(null);
        setIsLoading(false);
      }, 0);

      return () => window.clearTimeout(resetId);
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;

      setIsLoading(true);
      setError(null);

      fetch(`/api/map/search?q=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Search is temporarily unavailable.");
          }

          return (await response.json()) as { results: LocationSearchResult[] };
        })
        .then((payload) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setResults(payload.results);
        })
        .catch((searchError) => {
          if (controller.signal.aborted || requestId !== requestIdRef.current) {
            return;
          }

          setResults([]);
          setError(searchError instanceof Error ? searchError.message : "Search failed.");
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        });
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSelect = (location: LocationSearchResult) => {
    onSelect(location);
    setQuery(location.name);
    setResults([]);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
      <div className="space-y-3" aria-busy={isLoading}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Find a location</h2>
            <p className="text-sm leading-6 text-white/55">Search by place name or landmark.</p>
          </div>

          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? "Locating..." : "Use current location"}
          </button>
        </div>

        <div>
          <label htmlFor="location-search" className="sr-only">
            Search locations
          </label>
          <input
            id="location-search"
            type="search"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a city, observatory, or mountain"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-describedby={error ? `${listId}-error` : undefined}
          />
        </div>

        {locationStatus ? <p className="text-xs text-cyan-100/70">{locationStatus}</p> : null}
        {query.trim().length >= 2 && error ? (
          <p id={`${listId}-error`} className="text-xs text-rose-200" role="alert">
            {error}
          </p>
        ) : null}
        {query.trim().length >= 2 && isLoading ? (
          <p className="text-xs text-white/45" role="status" aria-live="polite">
            Searching locations...
          </p>
        ) : null}
      </div>

      {query.trim().length >= 2 && results.length > 0 ? (
        <ul id={listId} role="listbox" className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
          {results.map((result) => (
            <li key={`${result.latitude}-${result.longitude}-${result.displayName}`}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
              >
                <div className="font-medium text-white">{result.name}</div>
                <div className="mt-1 text-xs leading-5 text-white/50">{result.displayName}</div>
              </button>
            </li>
          ))}
        </ul>
      ) : query.trim().length >= 2 && !isLoading && !error ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/55" role="status" aria-live="polite">
          No locations found. Try a broader search term or a nearby landmark.
        </div>
      ) : null}
    </div>
  );
}