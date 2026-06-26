import { WEATHER_USER_AGENT } from '@/constants/location';
import type { MetNoForecastResponse, WeatherSnapshot } from '@/types/weather';

const LOCATIONFORECAST_URL =
  'https://api.met.no/weatherapi/locationforecast/2.0/compact';

export class WeatherApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const url = `${LOCATIONFORECAST_URL}?lat=${latitude}&lon=${longitude}`;

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

  const json: MetNoForecastResponse = await response.json();
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
  };
}
