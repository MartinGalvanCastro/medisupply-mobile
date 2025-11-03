# Axios Interceptor-Based Mocking System

A lightweight, React Native-compatible mocking solution that uses Axios interceptors to simulate API responses during development and testing.

## Overview

This mocking system replaces MSW (Mock Service Worker) with a custom Axios interceptor approach that:
- **Works natively in React Native** - No Node.js-specific APIs required
- **Zero async initialization** - Mocks are ready immediately when the app starts
- **Type-safe** - Full TypeScript support with generated API types
- **Environment-controlled** - Easy toggle via environment variables
- **Realistic behavior** - Network delays, error scenarios, and validation

## Architecture

```
src/api/
├── client.ts                          # Axios instance with interceptor setup
├── mock-interceptor.ts                # Core interceptor logic
└── mocks/
    ├── config.ts                      # Mock configuration and scenarios
    ├── data/
    │   └── users.data.ts             # Centralized mock data
    └── handlers/
        ├── types.ts                   # TypeScript types for handlers
        ├── index.ts                   # Handler exports
        └── authentication.handlers.ts # Auth endpoint handlers
```

## How It Works

### 1. Interceptor Registration
When the Axios instance is created (`src/api/client.ts`), the mock interceptor is registered:

```typescript
import { setupMockInterceptor } from './mock-interceptor';
import { handlers } from './mocks/handlers';

setupMockInterceptor(axiosInstance, handlers);
```

### 2. Request Matching
When a request is made, the interceptor:
1. Checks if mocking is enabled (`EXPO_PUBLIC_ENABLE_MOCKS=true`)
2. Tries to match the request against registered handlers
3. If matched, executes the handler and returns mock response
4. If not matched, passes the request to the real API

### 3. Mock Response
Handlers return a `MockResponse` object:

```typescript
{
  status: 200,
  data: { /* response body */ },
  headers?: { /* optional headers */ }
}
```

The interceptor converts this into a proper Axios response or error.

## Configuration

### Environment Variables

Set these in your `.env`, `.env.development`, or `.env.production` files:

```bash
# Enable/disable mocking
EXPO_PUBLIC_ENABLE_MOCKS=true

# Enable console logging for mock requests
EXPO_PUBLIC_MOCK_LOGGING=true

# Network delay in milliseconds (simulates latency)
EXPO_PUBLIC_MOCK_DELAY=750
```

### Runtime Configuration

You can modify mock behavior at runtime:

```typescript
import { mockConfig, updateMockConfig } from '@/api/mocks/config';

// Change scenarios for different test cases
updateMockConfig({
  scenarios: {
    authentication: 'error', // 'success' | 'error' | 'empty' | 'slow'
  },
});

// Disable network delay for faster tests
updateMockConfig({ delay: 0 });

// Disable logging
updateMockConfig({ logging: false });
```

## Creating Mock Handlers

### Step 1: Define Mock Data

Add your mock data to `src/api/mocks/data/`:

```typescript
// src/api/mocks/data/products.data.ts
export interface MockProduct {
  id: string;
  name: string;
  price: number;
}

export const mockProducts: MockProduct[] = [
  { id: '1', name: 'Surgical Mask', price: 25.00 },
  { id: '2', name: 'Latex Gloves', price: 15.50 },
];

export const findProductById = (id: string) => {
  return mockProducts.find(p => p.id === id);
};
```

### Step 2: Create Handlers

Create a handler file in `src/api/mocks/handlers/`:

```typescript
// src/api/mocks/handlers/products.handlers.ts
import type { AxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './types';
import { mockProducts, findProductById } from '../data/products.data';

// GET /products
const listProductsHandler: MockHandler = {
  method: 'GET',
  endpoint: '/products',
  description: 'List all products',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Access query parameters
    const params = config.params || {};
    const limit = params.limit || mockProducts.length;

    return {
      status: 200,
      data: {
        products: mockProducts.slice(0, limit),
        total: mockProducts.length,
      },
    };
  },
};

// GET /products/:id
const getProductHandler: MockHandler = {
  method: 'GET',
  endpoint: /\/products\/([a-zA-Z0-9-]+)$/,  // RegExp for dynamic routes
  description: 'Get product by ID',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Extract ID from URL
    const match = config.url?.match(/\/products\/([a-zA-Z0-9-]+)$/);
    const id = match?.[1];

    if (!id) {
      return {
        status: 400,
        data: { detail: 'Product ID is required' },
      };
    }

    const product = findProductById(id);

    if (!product) {
      return {
        status: 404,
        data: { detail: 'Product not found' },
      };
    }

    return {
      status: 200,
      data: product,
    };
  },
};

// POST /products
const createProductHandler: MockHandler = {
  method: 'POST',
  endpoint: '/products',
  description: 'Create a new product',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse request body - handle both string and object
    const body = (typeof config.data === 'string'
      ? JSON.parse(config.data)
      : config.data || {});

    // Validation
    if (!body.name || !body.price) {
      return {
        status: 422,
        data: {
          detail: [
            {
              loc: ['body', !body.name ? 'name' : 'price'],
              msg: 'field required',
              type: 'value_error.missing',
            },
          ],
        },
      };
    }

    // Create new product
    const newProduct = {
      id: `${Date.now()}`,
      name: body.name,
      price: body.price,
    };

    mockProducts.push(newProduct);

    return {
      status: 201,
      data: newProduct,
    };
  },
};

export const productHandlers: MockHandler[] = [
  listProductsHandler,
  getProductHandler,
  createProductHandler,
];
```

### Step 3: Register Handlers

Add your handlers to `src/api/mocks/handlers/index.ts`:

```typescript
import { authenticationHandlers } from './authentication.handlers';
import { productHandlers } from './products.handlers';

export const handlers: MockHandler[] = [
  ...authenticationHandlers,
  ...productHandlers,  // Add your new handlers here
];
```

That's it! The interceptor will automatically pick up your new handlers.

## Handler Patterns

### Matching Requests

**Exact string match:**
```typescript
endpoint: '/auth/login'  // Matches only /auth/login
```

**String includes:**
```typescript
endpoint: '/users'  // Matches /users, /api/users, etc.
```

**Regular expression:**
```typescript
endpoint: /\/users\/\d+$/  // Matches /users/123, /users/456
```

### Accessing Request Data

**Request body:**
```typescript
// Handle both string and object cases
const body = (typeof config.data === 'string'
  ? JSON.parse(config.data)
  : config.data || {});
```

**Query parameters:**
```typescript
const params = config.params || {};
const page = params.page || 1;
```

**Headers:**
```typescript
const authHeader = config.headers?.['Authorization'];
const token = authHeader?.replace('Bearer ', '');
```

**URL parameters:**
```typescript
const match = config.url?.match(/\/users\/(\d+)$/);
const userId = match?.[1];
```

### Response Patterns

**Success response:**
```typescript
return {
  status: 200,
  data: { message: 'Success' },
};
```

**Error response:**
```typescript
return {
  status: 401,
  data: { detail: 'Unauthorized' },
};
```

**With custom headers:**
```typescript
return {
  status: 200,
  data: { message: 'Success' },
  headers: {
    'X-Custom-Header': 'value',
  },
};
```

### Async Delays

Simulate slow network:

```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

handler: async (config) => {
  await delay(3000);  // 3 second delay
  return { status: 200, data: {} };
}
```

### Scenario Testing

Use scenarios to test different states:

```typescript
import { mockConfig } from '../config';

handler: async (config) => {
  if (mockConfig.scenarios.products === 'error') {
    return { status: 500, data: { detail: 'Server error' } };
  }

  if (mockConfig.scenarios.products === 'empty') {
    return { status: 200, data: { products: [] } };
  }

  // Normal success case
  return { status: 200, data: { products: mockProducts } };
}
```

Then in your app:

```typescript
import { updateMockConfig } from '@/api/mocks/config';

// Test error state
updateMockConfig({
  scenarios: { products: 'error' }
});
```

## Testing Scenarios

### Available Test Users

The authentication handlers come with pre-configured test users:

```typescript
// Client user
Email: client@medisupply.com
Password: Test1234!
Type: client

// Seller user
Email: seller@medisupply.com
Password: Test1234!
Type: seller

// Admin user
Email: admin@medisupply.com
Password: Admin1234!
Type: admin (has all permissions)
```

### Testing Different Scenarios

```typescript
import { updateMockConfig } from '@/api/mocks/config';

// Test successful login
updateMockConfig({
  scenarios: { authentication: 'success' }
});

// Test server errors
updateMockConfig({
  scenarios: { authentication: 'error' }
});

// Test slow network
updateMockConfig({
  scenarios: { authentication: 'slow' }
});

// Test with no delay (faster tests)
updateMockConfig({ delay: 0 });
```

## Debugging

### Console Logging

When `EXPO_PUBLIC_MOCK_LOGGING=true`, you'll see:

```
[Mock] Interceptor initialized
[Mock] API Base URL: http://localhost:8000
[Mock] Mocking enabled: true
[Mock] Logging enabled: true
[Mock] Network delay: 750 ms
[Mock] Registered handlers: 4

[Mock] Available mock users:
  - client@medisupply.com (password: Test1234!)
  - seller@medisupply.com (password: Test1234!)
  - admin@medisupply.com (password: Admin1234!)

[Mock] POST /auth/login
[Mock] POST /auth/login - 200
```

### Request/Response Inspection

In your handlers, you can log details:

```typescript
handler: async (config) => {
  console.log('Request URL:', config.url);
  console.log('Request method:', config.method);
  console.log('Request body:', config.data);
  console.log('Request headers:', config.headers);

  const response = { status: 200, data: {} };
  console.log('Response:', response);

  return response;
}
```

## Toggling Mocks On/Off

### Development (Mocks ON)
```bash
# .env.development
EXPO_PUBLIC_ENABLE_MOCKS=true
```

### Production (Mocks OFF)
```bash
# .env.production
EXPO_PUBLIC_ENABLE_MOCKS=false
```

### Runtime Toggle
```typescript
import { updateMockConfig } from '@/api/mocks/config';

// Disable mocking
updateMockConfig({ enabled: false });

// Re-enable mocking
updateMockConfig({ enabled: true });
```

## Best Practices

### 1. Centralize Mock Data
Keep all mock data in `data/` files, not in handlers:

**Good:**
```typescript
// data/users.data.ts
export const mockUsers = [/* ... */];

// handlers/users.handlers.ts
import { mockUsers } from '../data/users.data';
```

**Bad:**
```typescript
// handlers/users.handlers.ts
const mockUsers = [/* ... */];  // Don't do this
```

### 2. Use TypeScript Types
Import types from generated models:

```typescript
import type { LoginRequest, LoginResponse } from '@/api/generated/models';

handler: async (config): Promise<MockResponse<LoginResponse>> => {
  const body = (typeof config.data === 'string'
    ? JSON.parse(config.data)
    : config.data) as LoginRequest;
  // TypeScript now validates your response
  return {
    status: 200,
    data: {
      access_token: '...',
      // ... must match LoginResponse type
    },
  };
}
```

### 3. Validate Inputs
Mimic real API validation:

```typescript
// Check required fields
if (!body.email || !body.password) {
  return { status: 422, data: { detail: 'Missing fields' } };
}

// Check email format
if (!isValidEmail(body.email)) {
  return { status: 400, data: { detail: 'Invalid email' } };
}
```

### 4. Use Realistic Data
Make mock data representative of production:

```typescript
// Good - realistic Colombian medical institution
{
  name: 'Hospital San Rafael de Bogotá',
  nit: '900123456-7',
  ciudad: 'Bogotá',
  telefono: '+57 301 234 5678',
}

// Bad - fake/unrealistic data
{
  name: 'Test Hospital',
  nit: '123',
  ciudad: 'Test City',
  telefono: '1234567890',
}
```

### 5. Add Descriptions
Document what each handler does:

```typescript
{
  method: 'POST',
  endpoint: '/auth/login',
  description: 'Authenticate user with email and password',
  handler: async (config) => { /* ... */ }
}
```

## Troubleshooting

### Mocks Not Working

1. **Check environment variable:**
   ```bash
   # Make sure this is set to 'true' (as string)
   EXPO_PUBLIC_ENABLE_MOCKS=true
   ```

2. **Restart Expo:**
   ```bash
   # Stop the server and clear cache
   expo start --clear
   ```

3. **Check console for initialization message:**
   ```
   [Mock] Interceptor initialized
   ```

### Handler Not Matching

1. **Check endpoint pattern:**
   ```typescript
   // If your API URL is: http://localhost:8000/api/v1/auth/login
   // And your endpoint is: '/auth/login'
   // It will match because the interceptor uses .includes()

   // For exact matching, use RegExp:
   endpoint: /^\/auth\/login$/
   ```

2. **Check HTTP method:**
   ```typescript
   // Method is case-sensitive in the handler
   method: 'POST',  // Must be uppercase
   ```

3. **Enable logging to see what's being matched:**
   ```bash
   EXPO_PUBLIC_MOCK_LOGGING=true
   ```

### TypeScript Errors

If you get type errors with mock data:

```typescript
// Use 'as any' for error responses (they don't match the success type)
return {
  status: 401,
  data: { detail: 'Unauthorized' } as any,
};
```

## Migration from MSW

If you're migrating from MSW, here's the conversion guide:

**MSW Handler:**
```typescript
import { http, HttpResponse, delay } from 'msw';

export const loginHandler = http.post('/auth/login', async ({ request }) => {
  await delay(750);
  const body = await request.json();

  return HttpResponse.json(
    { access_token: '...' },
    { status: 200 }
  );
});
```

**Interceptor Handler:**
```typescript
import type { AxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './types';

export const loginHandler: MockHandler = {
  method: 'POST',
  endpoint: '/auth/login',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    const body = (typeof config.data === 'string'
      ? JSON.parse(config.data)
      : config.data || {});

    return {
      status: 200,
      data: { access_token: '...' },
    };
  },
};
```

**Key Differences:**
1. No `http.post()` wrapper - use object with `method` and `endpoint`
2. No `HttpResponse.json()` - return plain object with `status` and `data`
3. No `delay()` - use `mockConfig.delay` (configured globally)
4. Access body via `config.data`, not `request.json()`
5. Export as array: `export const handlers: MockHandler[] = [...]`

## Architecture Principles

1. **Centralized Data** - All mock data in `/data` directory
2. **Realistic Responses** - Use actual API response types
3. **Error Scenarios** - Support testing error states
4. **Colombian Context** - Use realistic Spanish/Colombian data
5. **Type Safety** - Import types from generated models

## Performance Considerations

### Handler Order Matters

Handlers are checked in order. Put specific patterns first:

```typescript
export const handlers: MockHandler[] = [
  // Specific patterns first
  { method: 'GET', endpoint: '/users/me' },
  { method: 'GET', endpoint: /\/users\/\d+$/ },

  // General patterns last
  { method: 'GET', endpoint: '/users' },
];
```

### Network Delay

Keep delays reasonable for development:

```bash
# Good for development (feels realistic)
EXPO_PUBLIC_MOCK_DELAY=750

# Good for testing (faster feedback)
EXPO_PUBLIC_MOCK_DELAY=100

# Good for CI/CD (maximum speed)
EXPO_PUBLIC_MOCK_DELAY=0
```

## Contributing

When adding new mock handlers:

1. Create mock data file in `data/`
2. Create handler file in `handlers/`
3. Export handlers from `handlers/index.ts`
4. Add test users/scenarios to mock data
5. Document in this README
