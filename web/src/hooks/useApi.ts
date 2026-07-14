import { useState, useEffect, useCallback } from '@/host-react';
import { api, ApiError } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface State<T> {
  data: T | null;
  meta: ApiResponse<T>['meta'] | null;
  status: Status;
  error: ApiError | null;
}

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  deps: any[] = [],
) {
  const [state, setState] = useState<State<T>>({
    data: null,
    meta: null,
    status: 'idle',
    error: null,
  });

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }));
    fetcher()
      .then((res) => {
        setState({
          data: res.data,
          meta: res.meta,
          status: 'success',
          error: null,
        });
      })
      .catch((err: ApiError) => {
        setState({
          data: null,
          meta: null,
          status: 'error',
          error: err,
        });
      });
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}
