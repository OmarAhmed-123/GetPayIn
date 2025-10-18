// **THE FINAL FIX IS HERE**: We are updating the import from the old 'react-query'
// to the new, compatible '@tanstack/react-query' library.
import { QueryClient } from '@tanstack/react-query';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Custom storage adapter for React Query
const mmkvStorage = {
  getItem: (key: string) => {
    const item = storage.getString(key);
    return item ? JSON.parse(item) : null;
  },
  setItem: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Persist cache to MMKV
export const persistQueryClient = () => {
  const cacheData = queryClient.getQueryCache();
  const queries = cacheData.getAll();
  
  const serializedQueries = queries.map(query => ({
    queryKey: query.queryKey,
    queryHash: query.queryHash,
    state: query.state,
    dataUpdatedAt: query.state.dataUpdatedAt,
  }));

  mmkvStorage.setItem('react-query-cache', serializedQueries);
};

// Restore cache from MMKV
export const restoreQueryClient = () => {
  const cachedQueries = mmkvStorage.getItem('react-query-cache');
  
  if (cachedQueries && Array.isArray(cachedQueries)) {
    cachedQueries.forEach((cachedQuery: any) => {
      queryClient.setQueryData(cachedQuery.queryKey, cachedQuery.state.data);
    });
  }
};