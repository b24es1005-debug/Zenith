import type { WeatherCloudCoverLabel } from "@/lib/weather/weather-types";

type WeatherBadgeProps = {
  label: WeatherCloudCoverLabel | string;
  tone?: "excellent" | "good" | "fair" | "poor" | "neutral";
};

const toneStyles: Record<NonNullable<WeatherBadgeProps["tone"]>, string> = {
  excellent: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  good: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  fair: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  poor: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  neutral: "border-white/10 bg-white/5 text-white/75",
};

export function WeatherBadge({ label, tone = "neutral" }: WeatherBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] ${toneStyles[tone]}`}>
      {label}
    </span>
  );
}