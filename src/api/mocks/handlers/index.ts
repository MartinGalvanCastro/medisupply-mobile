/**
 * Mock Handlers Index
 *
 * Central export point for all Axios interceptor mock handlers.
 * Add new handler modules here as they are implemented.
 */

import type { MockHandler } from './types';
import { authenticationHandlers } from './authentication.handlers';
import { clientHandlers } from './clients.handlers';
import { productHandlers } from './products.handlers';
import { inventoryHandlers } from './inventory.handlers';
import { visitHandlers } from './visits.handlers';
import { orderHandlers } from './orders.handlers';

/**
 * All request handlers combined
 * This array is passed to the mock interceptor setup
 */
export const handlers: MockHandler[] = [
  ...authenticationHandlers,
  ...clientHandlers,
  ...productHandlers,
  ...inventoryHandlers,
  ...visitHandlers,
  ...orderHandlers,
];

export {
  authenticationHandlers,
  clientHandlers,
  productHandlers,
  inventoryHandlers,
  visitHandlers,
  orderHandlers,
};
export type { MockHandler, MockResponse, HttpMethod } from './types';
