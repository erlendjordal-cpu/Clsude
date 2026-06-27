import { WEATHER_USER_AGENT } from '@/constants/location';
import type {
  ForecastPoint,
  MetNoForecastResponse,
  MetNoOceanForecastResponse,
  WeatherForecast,
  WeatherSnapshot,
} from '@/types/weather';

const LOCATIONFORECAST_URL =
  'https://api.met.no/weatherapi/locationforecast/2.0/complete';
const OCEANFORECAST_URL =
  'https://api.met.no/weatherapi/oceanforecast/2.0/complete';

export class WeatherApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': WEATHER_USER_AGENT,
        Accept: 'application/json',
      },
    });
  } catch {
    throw new WeatherApiError(
      'Kunne ikke nå værtjenesten. Sjekk internettforbindelsen.'
    );
  }

  if (!response.ok) {
    throw new WeatherApiError(
      `Værtjenesten svarte med feil (${response.status}).`,
      response.status
    );
  }

  return response.json();
}

async function fetchOceanTimeseries(
  latitude: number,
  longitude: number
): Promise<Map<string, number>> {
  try {
    const json = await fetchJson<MetNoOceanForecastResponse>(
      `${OCEANFORECAST_URL}?lat=${latitude}&lon=${longitude}`
    );
    const map = new Map<string, number>();
    for (const step of json.properties?.timeseries ?? []) {
      const h = step.data?.instant?.details?.sea_surface_wave_height;
      if (typeof h === 'number') map.set(step.time, h);
    }
    return map;
  } catch {
    return new Map();
  }
}

function findWaveHeight(
  time: string,
  oceanMap: Map<string, number>
): number | undefined {
  if (oceanMap.has(time)) return oceanMap.get(time);
  const target = new Date(time).getTime();
  for (const [key, val] of oceanMap) {
    if (Math.abs(new Date(key).getTime() - target) <= 6 * 3_600_000) {
      return val;
    }
  }
  return undefined;
}

export async function fetchForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecast> {
  const [json, oceanMap] = await Promise.all([
    fetchJson<MetNoForecastResponse>(
      `${LOCATIONFORECAST_URL}?lat=${latitude}&lon=${longitude}`
    ),
    fetchOceanTimeseries(latitude, longitude),
  ]);

  const timeseries = json.properties?.timeseries;
  if (!timeseries || timeseries.length === 0) {
    throw new WeatherApiError('Ingen værdata tilgjengelig for denne posisjonen.');
  }

  const hourly: ForecastPoint[] = timeseries.map((step) => {
    const d = step.data.instant.details;
    const next = step.data.next_1_hours ?? step.data.next_6_hours;
    return {
      time: step.time,
      temperature: d.air_temperature,
      windSpeed: d.wind_speed,
      windFromDirection: d.wind_from_direction,
      windGust: d.wind_speed_of_gust,
      precipitation: next?.details?.precipitation_amount,
      symbolCode: next?.summary.symbol_code,
      fogAreaFraction: d.fog_area_fraction,
      cloudAreaFraction: d.cloud_area_fraction,
      probabilityOfThunder: d.probability_of_thunder,
      waveHeight: findWaveHeight(step.time, oceanMap),
    };
  });

  const first = timeseries[0];
  const d0 = first.data.instant.details;
  const next0 = first.data.next_1_hours ?? first.data.next_6_hours;
  const current: WeatherSnapshot = {
    temperature: d0.air_temperature,
    windSpeed: d0.wind_speed,
    windFromDirection: d0.wind_from_direction,
    windGust: d0.wind_speed_of_gust,
    humidity: d0.relative_humidity,
    pressure: d0.air_pressure_at_sea_level,
    symbolCode: next0?.summary.symbol_code,
    precipitation: next0?.details?.precipitation_amount,
    forecastTime: first.time,
    updatedAt: json.properties.meta.updated_at,
    fogAreaFraction: d0.fog_area_fraction,
    cloudAreaFraction: d0.cloud_area_fraction,
    probabilityOfThunder: d0.probability_of_thunder,
    waveHeight: findWaveHeight(first.time, oceanMap),
    waveDataUnavailable: oceanMap.size === 0,
  };

  return { current, hourly, updatedAt: json.properties.meta.updated_at };
}

// Legacy single-snapshot fetch kept for compatibility
export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const forecast = await fetchForecast(latitude, longitude);
  return forecast.current;
}
