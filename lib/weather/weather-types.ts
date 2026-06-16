export type WeatherCondition = {
  main: string;
  description: string;
  icon: string;
};

export type WeatherCloudCoverLabel = "Excellent" | "Good" | "Fair" | "Poor";

export type WeatherData = {
  latitude: number;
  longitude: number;
  locationName: string;
  temperatureC: number;
  cloudCoverPct: number;
  visibilityKm: number | null;
  humidityPct: number;
  windSpeedMps: number;
  weatherCondition: WeatherCondition;
  sunrise: number;
  sunset: number;
  timezoneOffsetSeconds: number;
  cloudCoverLabel: WeatherCloudCoverLabel;
  skyLikelyClear: boolean;
};

export type OpenWeatherCurrentResponse = {
  lat: number;
  lon: number;
  timezone_offset: number;
  current: {
    temp: number;
    humidity: number;
    visibility?: number;
    wind_speed: number;
    clouds: number;
    sunrise: number;
    sunset: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  timezone: string;
};