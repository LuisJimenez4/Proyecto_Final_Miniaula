import { useState, useEffect, useCallback, useRef } from 'react';
import { parseApiError } from '../utils/apiError';

/**
 * RT-F04: hook para cargar datos remotos con estados de carga y error.
 *   const { data, loading, error, refetch } = useFetch(() => getCursoById(id), { deps: [id] });
 * `error` es { message, code, details } (ya interpretado por parseApiError).
 * La función puede cambiar en cada render: se vuelve a ejecutar solo cuando cambian `deps`.
 */
export const useFetch = (fetchFunction, { deps = [], immediate = true, initialData = null } = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchRef = useRef(fetchFunction);
  fetchRef.current = fetchFunction;
  const lastRequest = useRef(0);

  const execute = useCallback((...args) => {
    const requestId = lastRequest.current + 1;
    lastRequest.current = requestId;
    setLoading(true);
    setError(null);

    return fetchRef.current(...args)
      .then((result) => {
        if (requestId === lastRequest.current) setData(result);
        return { data: result, error: null };
      })
      .catch((err) => {
        const parsed = parseApiError(err);
        if (requestId === lastRequest.current) setError(parsed);
        return { data: null, error: parsed };
      })
      .finally(() => {
        if (requestId === lastRequest.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate, ...deps]);

  return { data, loading, error, refetch: execute, setData };
};

export default useFetch;
