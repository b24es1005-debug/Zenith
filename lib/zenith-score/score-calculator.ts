import type {
  ZenithAstronomyEventSignal,
  ZenithScoreBreakdownItem,
  ZenithScoreCategory,
  ZenithScoreContext,
  ZenithScoreResult,
} from "@/lib/zenith-score/zenith-score-types";

type ComponentConfig = {
  key: ZenithScoreBreakdownItem["key"];
  label: string;
  weight: number;
  componentScore: number;
  note: string;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value);
}

function normalizeCloudCover(cloudCoverPct: number) {
  if (cloudCoverPct <= 10) return 100;
  if (cloudCoverPct <= 25) return 82 + ((25 - cloudCoverPct) / 15) * 8;
  if (cloudCoverPct <= 50) return 40 + ((50 - cloudCoverPct) / 25) * 42;
  return clamp(40 - ((cloudCoverPct - 50) / 50) * 40);
}

function normalizeVisibility(visibilityKm: number | null) {
  if (visibilityKm === null || !Number.isFinite(visibilityKm)) {
    return 50;
  }

  return clamp((visibilityKm / 20) * 100);
}

function normalizeHumidity(humidityPct: number) {
  return clamp(100 - humidityPct);
}

function normalizeWind(windSpeedMps: number) {
  if (windSpeedMps <= 2) return 100;
  if (windSpeedMps <= 5) return 85;
  if (windSpeedMps <= 10) return 60;
  if (windSpeedMps <= 15) return 35;
  return 10;
}

function normalizeLightPollution(normalizedScore: number, bortleClass: number) {
  const normalizedComponent = clamp(100 - normalizedScore);
  const bortleComponent = clamp(((9 - (bortleClass - 1)) / 8) * 100);
  return round(normalizedComponent * 0.7 + bortleComponent * 0.3);
}

function getCategory(score: number): ZenithScoreCategory {
  if (score >= 90) return "Excellent Stargazing";
  if (score >= 75) return "Good Conditions";
  if (score >= 50) return "Fair Conditions";
  if (score >= 25) return "Poor Conditions";
  return "Very Poor Conditions";
}

function getRecommendation(score: number, category: ZenithScoreCategory, moonPhase?: ZenithScoreContext["moonPhase"], astronomyEvents?: ZenithAstronomyEventSignal[]) {
  const moonSuffix = moonPhase ? ` Moon: ${moonPhase.phaseName} (${moonPhase.illuminationPct}%).` : "";
  const eventSuffix = astronomyEvents && astronomyEvents.length > 0 ? ` Events: ${astronomyEvents.map((event) => event.name).join(", ")}.` : "";

  switch (category) {
    case "Excellent Stargazing":
      return `Excellent Stargazing Night. Ideal for deep-sky viewing and long observing sessions.${moonSuffix}${eventSuffix}`;
    case "Good Conditions":
      return `Good Conditions. A strong choice for most targets, especially under darker horizons.${moonSuffix}${eventSuffix}`;
    case "Fair Conditions":
      return `Fair Conditions. Best for brighter deep-sky objects and selected planetary observing.${moonSuffix}${eventSuffix}`;
    case "Poor Conditions":
      return `Poor Conditions. Favor the Moon, planets, or brighter clusters tonight.${moonSuffix}${eventSuffix}`;
    case "Very Poor Conditions":
      return `Very Poor Conditions. Bright targets only; consider another night if possible.${moonSuffix}${eventSuffix}`;
  }
}

function buildBreakdown(context: ZenithScoreContext) {
  const components: ComponentConfig[] = [
    {
      key: "weather",
      label: "Weather",
      weight: 30,
      componentScore: round(normalizeCloudCover(context.weather.cloudCoverPct)),
      note: context.weather.cloudCoverPct <= 10 ? "Excellent cloud cover" : context.weather.cloudCoverPct <= 25 ? "Good cloud cover" : context.weather.cloudCoverPct <= 50 ? "Fair cloud cover" : "Poor cloud cover",
    },
    {
      key: "visibility",
      label: "Visibility",
      weight: 20,
      componentScore: round(normalizeVisibility(context.weather.visibilityKm)),
      note: context.weather.visibilityKm === null ? "Visibility unavailable" : `${context.weather.visibilityKm.toFixed(1)} km visibility`,
    },
    {
      key: "humidity",
      label: "Humidity",
      weight: 15,
      componentScore: round(normalizeHumidity(context.weather.humidityPct)),
      note: `${context.weather.humidityPct}% humidity`,
    },
    {
      key: "wind",
      label: "Wind",
      weight: 10,
      componentScore: round(normalizeWind(context.weather.windSpeedMps)),
      note: `${context.weather.windSpeedMps.toFixed(1)} m/s wind`,
    },
    {
      key: "lightPollution",
      label: "Light Pollution",
      weight: 25,
      componentScore: round(normalizeLightPollution(context.lightPollution.normalizedScore, context.lightPollution.bortleClass)),
      note: `Bortle ${context.lightPollution.bortleClass} · ${context.lightPollution.lightPollutionLevel}`,
    },
  ];

  return components.map((component) => ({
    key: component.key,
    label: component.label,
    weight: component.weight,
    componentScore: component.componentScore,
    contribution: round((component.componentScore * component.weight) / 100),
    note: component.note,
  }));
}

export function calculateZenithScore(context: ZenithScoreContext): ZenithScoreResult {
  const breakdown = buildBreakdown(context);
  const score = clamp(breakdown.reduce((total, item) => total + item.contribution, 0));
  const category = getCategory(score);

  return {
    score,
    category,
    recommendation: getRecommendation(score, category, context.moonPhase, context.astronomyEvents),
    breakdown,
    weather: context.weather,
    lightPollution: context.lightPollution,
    moonPhase: context.moonPhase,
    astronomyEvents: context.astronomyEvents,
  };
}