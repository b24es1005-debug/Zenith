export type LightPollutionData = {
  latitude: number;
  longitude: number;
  locationName: string;
  bortleClass: number;
  lightPollutionLevel: string;
  skyQualityRating: string;
  normalizedScore: number;
  stargazingRecommendation: string;
  description: string;
  sourceLabel: string;
};

export type NominatimReverseResponse = {
  display_name: string;
  lat: string;
  lon: string;
  category?: string;
  type?: string;
  name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};