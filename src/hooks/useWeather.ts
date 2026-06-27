import { useCallback, useEffect, useState } from 'react';

import { fetchForecast, WeatherApiError } from '@/services/weather';
import type { WeatherForecast } from '@/types/weather';

interface UseForecastResult {
  data: WeatherForecast | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useForecast(latitude: number, longitude: number): UseForecastResult {
  const [data, setData] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const forecast = await fetchForecast(latitude, longitude);
        setData(forecast);
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
