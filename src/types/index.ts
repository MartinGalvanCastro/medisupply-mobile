// Barrel export for types

export type AppStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export type PaginationParams = {
  limit?: number;
  offset?: number;
};
