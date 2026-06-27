export interface MetNoForecastResponse {
  properties: {
    meta: {
      updated_at: string;
    };
    timeseries: MetNoTimeStep[];
  };
}

export interface MetNoTimeStep {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        wind_from_direction: number;
        relative_humidity?: number;
        air_pressure_at_sea_level?: number;
        wind_speed_of_gust?: number;
        fog_area_fraction?: number;
        cloud_area_fraction?: number;
        probability_of_thunder?: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details?: { precipitation_amount?: number };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details?: { precipitation_amount?: number };
    };
  };
}

export interface MetNoOceanForecastResponse {
  properties?: {
    timeseries?: MetNoOceanTimeStep[];
  };
}

export interface MetNoOceanTimeStep {
  time: string;
  data?: {
    instant?: {
      details?: {
        sea_surface_wave_height?: number;
      };
    };
  };
}

export interface ForecastPoint {
  time: string;
  temperature: number;
  windSpeed: number;
  windFromDirection: number;
  windGust?: number;
  symbolCode?: string;
  precipitation?: number;
  fogAreaFraction?: number;
  cloudAreaFraction?: number;
  probabilityOfThunder?: number;
  waveHeight?: number;
}

export interface WeatherSnapshot {
  temperature: number;
  windSpeed: number;
  windFromDirection: number;
  windGust?: number;
  humidity?: number;
  pressure?: number;
  symbolCode?: string;
  precipitation?: number;
  forecastTime: string;
  updatedAt: string;
  fogAreaFraction?: number;
  cloudAreaFraction?: number;
  probabilityOfThunder?: number;
  waveHeight?: number;
  waveDataUnavailable?: boolean;
}

export interface ForecastPoint {
  time: string;
  temperature: number;
  windSpeed: number;
  windFromDirection: number;
  windGust?: number;
  precipitation?: number;
  symbolCode?: string;
  fogAreaFraction?: number;
  cloudAreaFraction?: number;
  probabilityOfThunder?: number;
  waveHeight?: number;
}

export interface WeatherForecast {
  current: WeatherSnapshot;
  hourly: ForecastPoint[];
  updatedAt: string;
}
