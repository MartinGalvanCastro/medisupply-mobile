import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import type { QueryClientProviderProps } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  return <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>;
};
