import { useCallback, useEffect, useState } from 'react';

import { fetchWeather, WeatherApiError } from '@/services/weather';
import type { WeatherSnapshot } from '@/types/weather';

interface UseWeatherResult {
  data: WeatherSnapshot | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWeather(latitude: number, longitude: number): UseWeatherResult {
  const [data, setData] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const snapshot = await fetchWeather(latitude, longitude);
        setData(snapshot);
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

  return { data, loading, refreshing, error, refresh };
}
