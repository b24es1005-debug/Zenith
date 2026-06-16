import { WeatherBadge } from "@/components/weather/WeatherBadge";

type WeatherDetailsProps = {
  temperatureC: number;
  cloudCoverPct: number;
  visibilityKm: number | null;
  humidityPct: number;
  windSpeedMps: number;
  sunrise: string;
  sunset: string;
  conditionDescription: string;
  cloudCoverLabel: string;
  skyLikelyClear: boolean;
};

function WeatherMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
      <dt className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
    </div>
  );
}

export function WeatherDetails({
  temperatureC,
  cloudCoverPct,
  visibilityKm,
  humidityPct,
  windSpeedMps,
  sunrise,
  sunset,
  conditionDescription,
  cloudCoverLabel,
  skyLikelyClear,
}: WeatherDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <WeatherBadge label={cloudCoverLabel} tone={skyLikelyClear ? "excellent" : cloudCoverLabel === "Good" ? "good" : cloudCoverLabel === "Fair" ? "fair" : "poor"} />
        <span className="text-xs text-white/50">{skyLikelyClear ? "Sky likely clear enough for astronomy" : "Cloud cover may limit visibility"}</span>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <WeatherMetric label="Temperature" value={`${temperatureC.toFixed(1)}°C`} />
        <WeatherMetric label="Cloud Cover" value={`${cloudCoverPct}%`} />
        <WeatherMetric label="Visibility" value={visibilityKm === null ? "N/A" : `${visibilityKm.toFixed(1)} km`} />
        <WeatherMetric label="Humidity" value={`${humidityPct}%`} />
        <WeatherMetric label="Wind Speed" value={`${windSpeedMps.toFixed(1)} m/s`} />
        <WeatherMetric label="Sunrise" value={sunrise} />
        <WeatherMetric label="Sunset" value={sunset} />
      </dl>

      <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">Weather Condition</p>
        <p className="mt-1 text-sm font-medium text-white">{conditionDescription}</p>
      </div>
    </div>
  );
}