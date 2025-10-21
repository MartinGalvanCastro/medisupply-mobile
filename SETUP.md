# Setup Guide

## Quick Start

Follow these steps to get the MediSupply mobile app running:

### 1. Install Dependencies

```bash
# Enable Corepack for Yarn
corepack enable

# Install dependencies
yarn install
```

### 2. Generate API Client

Generate the TypeScript API client from your BFF OpenAPI spec:

```bash
yarn generate:api
```

This will create type-safe API hooks in `src/api/generated/` that you can use throughout the app.

### 3. Run the App

```bash
# Start Metro bundler
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run in web browser
yarn web
```

## Development Workflow

### Making API Calls

After generating the API client, you'll have React Query hooks available:

```typescript
import { useGetProducts, useCreateProduct } from '@/api/generated/products';

function MyComponent() {
  // Query hook
  const { data, isLoading } = useGetProducts({ limit: 10 });

  // Mutation hook
  const { mutate: createProduct } = useCreateProduct();

  const handleCreate = () => {
    createProduct({
      data: {
        name: 'New Product',
        // ... other fields
      }
    });
  };
}
```

### Adding New Components

1. Create component in `src/components/`
2. Add barrel export in `src/components/index.ts`
3. Use clean imports: `import { MyComponent } from '@/components'`

### Adding New Screens

1. Create file in `app/` directory (Expo Router convention)
2. Example: `app/orders/index.tsx` → route: `/orders`
3. Dynamic routes: `app/orders/[id].tsx` → route: `/orders/:id`

## Testing

### Run Unit Tests

```bash
yarn test
```

### Run E2E Tests

#### iOS

```bash
# First time: prebuild native code
yarn prebuild:ios

# Build app for testing
yarn test:e2e:build:ios

# Run tests
yarn test:e2e:ios
```

#### Android

```bash
# First time: prebuild native code
yarn prebuild:android

# Build app for testing
yarn test:e2e:build:android

# Start emulator, then run tests
yarn test:e2e:android
```

## Troubleshooting

### API Generation Fails

If `yarn generate:api` fails:

1. Check internet connection (needs to fetch OpenAPI spec)
2. Verify the BFF URL is accessible: https://bffproyecto.juanandresdeveloper.com/bff/openapi.json
3. Check `orval.config.ts` configuration

### iOS Build Issues

```bash
# Clean build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..
```

### Android Build Issues

```bash
# Clean Gradle
cd android && ./gradlew clean && cd ..

# Clear cache
cd android && ./gradlew cleanBuildCache && cd ..
```

### Metro Bundler Issues

```bash
# Clear Metro cache
yarn start --clear
```

## Next Steps

1. **Configure authentication**: Update `src/api/client.ts` to add auth tokens
2. **Add more screens**: Create new routes in the `app/` directory
3. **Customize theme**: Modify colors in `src/constants/index.ts`
4. **Add more tests**: Create test files in `e2e/` for new features
5. **Set up EAS**: Configure `eas.json` for building production apps

## Useful Commands

```bash
# Generate API client
yarn generate:api

# Type check
yarn type-check

# Lint code
yarn lint

# Run all tests
yarn test

# Build for production (requires EAS)
eas build --platform ios
eas build --platform android
```

## Project Structure Reference

```
├── app/                    # Expo Router screens (file-based routing)
├── src/
│   ├── api/               # API client and generated code
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   └── constants/        # App-wide constants
├── e2e/                  # Detox E2E tests
└── .github/workflows/    # CI/CD pipelines
```

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Query](https://tanstack.com/query/latest)
- [Detox](https://wix.github.io/Detox/)
- [Orval](https://orval.dev/)
