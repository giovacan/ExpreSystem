// src/frontend/src/hooks/useFetch.js

/**
 * HOOK: useFetch
 * Fetch genérico para peticiones HTTP
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(url, options);
      setData(response);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.mensaje || err.message || 'Error al cargar';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (options.skipInitial) return;
    fetch();
  }, [fetch, options.skipInitial]);

  const refetch = useCallback(() => fetch(), [fetch]);

  return { data, loading, error, refetch };
}
