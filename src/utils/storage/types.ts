export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  getAllKeys?: () => string[];
}

export interface TypedStorage {
  setString: (key: string, value: string) => void;
  getString: (key: string) => string | undefined;
  setNumber: (key: string, value: number) => void;
  getNumber: (key: string) => number | undefined;
  setBoolean: (key: string, value: boolean) => void;
  getBoolean: (key: string) => boolean | undefined;
  setObject: <T>(key: string, value: T) => void;
  getObject: <T>(key: string) => T | null;
  delete: (key: string) => void;
  clearAll: () => void;
  contains: (key: string) => boolean;
  getAllKeys: () => string[];
}
