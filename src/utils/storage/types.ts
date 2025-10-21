/**
 * Storage types and interfaces
 */

export interface StorageAdapter {
  setItem: (key: string, value: string) => void | Promise<void>;
  getItem: (key: string) => string | undefined | null | Promise<string | undefined | null>;
  removeItem: (key: string) => void | Promise<void>;
}

export interface PersistedState<T> {
  state: T;
  version?: number;
}
