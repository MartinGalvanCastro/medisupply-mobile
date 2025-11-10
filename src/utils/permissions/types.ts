import { RESULTS } from 'react-native-permissions';

export type PermissionStatus =
  | typeof RESULTS.UNAVAILABLE
  | typeof RESULTS.DENIED
  | typeof RESULTS.BLOCKED
  | typeof RESULTS.GRANTED
  | typeof RESULTS.LIMITED;

export type PermissionType = 'camera' | 'photoLibrary' | 'mediaLibrary';

export interface PermissionCache {
  status: PermissionStatus;
  lastChecked: number;
  requestCount: number;
  rationaleShown: boolean;
  lastRequestedAt?: number;
}

export interface PermissionMetadata {
  [key: string]: PermissionCache;
}
