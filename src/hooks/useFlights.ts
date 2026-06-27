import { useCallback, useEffect, useState } from 'react';

import { AvinorApiError, fetchHelicopterDepartures, type AvinorFlight } from '@/services/avinorFlights';

export interface UseFlightsResult {
  flights: AvinorFlight[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useFlights(): UseFlightsResult {
  const [flights, setFlights] = useState<AvinorFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh: boolean) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setFlights(await fetchHelicopterDepartures());
    } catch (e) {
      setError(
        e instanceof AvinorApiError ? e.message : 'Noe gikk feil under henting av flydata.'
      );
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);
  return { flights, loading, refreshing, error, refresh };
}
