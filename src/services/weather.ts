import { WEATHER_USER_AGENT } from '@/constants/location';
import type {
  ForecastPoint,
  MetNoForecastResponse,
  MetNoOceanForecastResponse,
  MetNoOceanTimeStep,
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
): Promise<MetNoOceanTimeStep[]> {
  try {
    const json = await fetchJson<MetNoOceanForecastResponse>(
      `${OCEANFORECAST_URL}?lat=${latitude}&lon=${longitude}`
    );
    return json.properties?.timeseries ?? [];
  } catch {
    return [];
  }
}

const MAX_OCEAN_MATCH_MS = 6 * 60 * 60 * 1000;

function findWaveHeight(
  oceanPoints: MetNoOceanTimeStep[],
  targetTime: string
): number | undefined {
  const targetMs = new Date(targetTime).getTime();
  let closest: MetNoOceanTimeStep | undefined;
  let closestDiff = Infinity;

  for (const point of oceanPoints) {
    const diff = Math.abs(new Date(point.time).getTime() - targetMs);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = point;
    }
  }

  if (!closest || closestDiff > MAX_OCEAN_MATCH_MS) return undefined;
  return closest.data?.instant?.details?.sea_surface_wave_height;
}

export interface WeatherData {
  current: WeatherSnapshot;
  points: ForecastPoint[];
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const [json, oceanPoints] = await Promise.all([
    fetchJson<MetNoForecastResponse>(
      `${LOCATIONFORECAST_URL}?lat=${latitude}&lon=${longitude}`
    ),
    fetchOceanTimeseries(latitude, longitude),
  ]);

  const timeseries = json.properties?.timeseries;

  if (!timeseries || timeseries.length === 0) {
    throw new WeatherApiError('Ingen værdata tilgjengelig for denne posisjonen.');
  }

  const points: ForecastPoint[] = timeseries.map((step) => {
    const details = step.data.instant.details;
    const nextHour = step.data.next_1_hours ?? step.data.next_6_hours;

    return {
      time: step.time,
      temperature: details.air_temperature,
      windSpeed: details.wind_speed,
      windFromDirection: details.wind_from_direction,
      windGust: details.wind_speed_of_gust,
      symbolCode: nextHour?.summary.symbol_code,
      precipitation: nextHour?.details?.precipitation_amount,
      fogAreaFraction: details.fog_area_fraction,
      cloudAreaFraction: details.cloud_area_fraction,
      probabilityOfThunder: details.probability_of_thunder,
      waveHeight: findWaveHeight(oceanPoints, step.time),
    };
  });

  const first = points[0];
  const firstDetails = timeseries[0].data.instant.details;

  const current: WeatherSnapshot = {
    temperature: first.temperature,
    windSpeed: first.windSpeed,
    windFromDirection: first.windFromDirection,
    windGust: first.windGust,
    humidity: firstDetails.relative_humidity,
    pressure: firstDetails.air_pressure_at_sea_level,
    symbolCode: first.symbolCode,
    precipitation: first.precipitation,
    forecastTime: first.time,
    updatedAt: json.properties.meta.updated_at,
    fogAreaFraction: first.fogAreaFraction,
    cloudAreaFraction: first.cloudAreaFraction,
    probabilityOfThunder: first.probabilityOfThunder,
    waveHeight: first.waveHeight,
    waveDataUnavailable: oceanPoints.length === 0,
  };

  return { current, points };
}
