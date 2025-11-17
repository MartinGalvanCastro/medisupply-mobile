import type { ReactNode } from 'react';
import type * as Ably from 'ably';

/**
 * Props for the AblyProvider component
 */
export interface AblyProviderProps {
  children: ReactNode;
}

/**
 * Context value provided by AblyProvider
 * Available via useAbly() hook
 */
export interface AblyContextValue {
  /** The Ably Realtime client instance (null if not connected) */
  ably: Ably.Realtime | null;
  /** Whether the connection is currently active */
  isConnected: boolean;
}
