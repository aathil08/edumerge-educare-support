import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/errors.js';

// Runs an async fetcher and tracks loading / error / data. Call reload() to retry.
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: '' });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: getErrorMessage(err, 'Unable to load data. Please try again.'),
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { ...state, reload };
}