import { useCallback, useEffect, useState } from 'react';

import { fetchWeatherData, WeatherApiError } from '@/services/weather';
import type { ForecastPoint, WeatherSnapshot } from '@/types/weather';

interface UseWeatherResult {
  data: WeatherSnapshot | null;
  points: ForecastPoint[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWeather(latitude: number, longitude: number): UseWeatherResult {
  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [points, setPoints] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const weatherData = await fetchWeatherData(latitude, longitude);
        setData(weatherData.current);
        setPoints(weatherData.points);
      } catch (err) {
        const message =
          err instanceof WeatherApiError
            ? err.message
            : 'Noe gikk feil under henting av værdata.';
        setError(message);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [latitude, longitude]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, points, loading, refreshing, error, refresh };
}
