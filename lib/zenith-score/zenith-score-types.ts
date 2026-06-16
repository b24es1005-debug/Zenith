import type { LightPollutionData } from "@/lib/light-pollution/light-pollution-types";
import type { WeatherData } from "@/lib/weather/weather-types";

export type ZenithScoreCategory =
  | "Excellent Stargazing"
  | "Good Conditions"
  | "Fair Conditions"
  | "Poor Conditions"
  | "Very Poor Conditions";

export type ZenithScoreFactorKey = "weather" | "visibility" | "humidity" | "wind" | "lightPollution";

export type ZenithScoreBreakdownItem = {
  key: ZenithScoreFactorKey;
  label: string;
  weight: number;
  componentScore: number;
  contribution: number;
  note: string;
};

export type ZenithMoonPhase = {
  illuminationPct: number;
  phaseName: string;
};

export type ZenithAstronomyEventSignal = {
  name: string;
  impact: number;
};

export type ZenithScoreContext = {
  weather: Pick<WeatherData, "cloudCoverPct" | "visibilityKm" | "humidityPct" | "windSpeedMps">;
  lightPollution: Pick<LightPollutionData, "bortleClass" | "normalizedScore" | "lightPollutionLevel" | "skyQualityRating">;
  moonPhase?: ZenithMoonPhase;
  astronomyEvents?: ZenithAstronomyEventSignal[];
};

export type ZenithScoreResult = {
  score: number;
  category: ZenithScoreCategory;
  recommendation: string;
  breakdown: ZenithScoreBreakdownItem[];
  weather: Pick<WeatherData, "cloudCoverPct" | "visibilityKm" | "humidityPct" | "windSpeedMps">;
  lightPollution: Pick<LightPollutionData, "bortleClass" | "normalizedScore" | "lightPollutionLevel" | "skyQualityRating">;
  moonPhase?: ZenithMoonPhase;
  astronomyEvents?: ZenithAstronomyEventSignal[];
};
