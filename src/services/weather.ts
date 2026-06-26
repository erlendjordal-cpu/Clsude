import { WEATHER_USER_AGENT } from '@/constants/location';
import type {
  MetNoForecastResponse,
  MetNoOceanForecastResponse,
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

async function fetchWaveHeight(
  latitude: number,
  longitude: number
): Promise<{ height?: number; unavailable: boolean }> {
  try {
    const json = await fetchJson<MetNoOceanForecastResponse>(
      `${OCEANFORECAST_URL}?lat=${latitude}&lon=${longitude}`
    );
    const height =
      json.properties?.timeseries?.[0]?.data?.instant?.details
        ?.sea_surface_wave_height;
    return typeof height === 'number'
      ? { height, unavailable: false }
      : { unavailable: true };
  } catch {
    return { unavailable: true };
  }
}

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const [json, wave] = await Promise.all([
    fetchJson<MetNoForecastResponse>(
      `${LOCATIONFORECAST_URL}?lat=${latitude}&lon=${longitude}`
    ),
    fetchWaveHeight(latitude, longitude),
  ]);

  const timeseries = json.properties?.timeseries;

  if (!timeseries || timeseries.length === 0) {
    throw new WeatherApiError('Ingen værdata tilgjengelig for denne posisjonen.');
  }

  const current = timeseries[0];
  const details = current.data.instant.details;
  const nextHour = current.data.next_1_hours ?? current.data.next_6_hours;

  return {
    temperature: details.air_temperature,
    windSpeed: details.wind_speed,
    windFromDirection: details.wind_from_direction,
    windGust: details.wind_speed_of_gust,
    humidity: details.relative_humidity,
    pressure: details.air_pressure_at_sea_level,
    symbolCode: nextHour?.summary.symbol_code,
    precipitation: nextHour?.details?.precipitation_amount,
    forecastTime: current.time,
    updatedAt: json.properties.meta.updated_at,
    fogAreaFraction: details.fog_area_fraction,
    cloudAreaFraction: details.cloud_area_fraction,
    probabilityOfThunder: details.probability_of_thunder,
    waveHeight: wave.height,
    waveDataUnavailable: wave.unavailable,
  };
}
