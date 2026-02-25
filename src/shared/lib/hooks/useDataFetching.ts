import { useState, useEffect, useCallback } from 'react';

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  immediate?: boolean;
}

export function useDataFetching<T>({
  fetchFn,
  dependencies = [],
  immediate = true,
}: UseDataFetchingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const refetch = useCallback(() => fetch(), [fetch]);

  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
}
