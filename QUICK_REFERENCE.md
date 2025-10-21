# Quick Reference Guide

## Code Generators

### Generate Component
```bash
yarn generate:component ComponentName
```
Creates: `src/components/ComponentName/` with 4 files (component, types, index, test)

### Generate Hook
```bash
yarn generate:hook useHookName
```
Creates: `src/hooks/useHookName/` with 4 files (hook, types, index, test)

### Generate Provider
```bash
yarn generate:provider ProviderName
```
Creates: `src/providers/ProviderName/` with 6 files (context, provider, hook, types, index, test)

## Common Commands

### Development
```bash
yarn start              # Start Metro bundler
yarn ios                # Run on iOS
yarn android            # Run on Android
yarn web                # Run on web
```

### API Generation
```bash
yarn generate:api       # Generate API client from OpenAPI spec
```

### Testing
```bash
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn lint               # Run ESLint
yarn type-check         # Run TypeScript checks
```

### E2E Testing
```bash
# iOS
yarn test:e2e:build:ios
yarn test:e2e:ios

# Android
yarn test:e2e:build:android
yarn test:e2e:android
```

### Build
```bash
yarn prebuild:ios       # Generate native iOS code
yarn prebuild:android   # Generate native Android code
```

## Import Patterns

### With Barrel Exports
```typescript
// Components
import { Button, Card, Text, ProductCard } from '@/components';
import { Button } from '@/components/ui';

// Hooks
import { useDebounce, useToggle } from '@/hooks';

// Store
import { useAuthStore } from '@/store';

// Utils
import { formatDate, formatCurrency } from '@/utils';

// Constants
import { COLORS, SPACING } from '@/constants';

// Providers
import { ThemeProvider, useTheme } from '@/providers';

// API
import { queryClient } from '@/api';
import { useGetProducts } from '@/api/generated/products';
```

## Folder Structure

```
src/
├── api/                 # API client and generated code
├── components/          # React components
│   ├── ui/             # Base UI components
│   └── [Feature]/      # Feature components
├── hooks/              # Custom hooks
├── providers/          # Context providers
├── store/              # Zustand stores
├── types/              # TypeScript types
├── utils/              # Helper functions
└── constants/          # Constants

app/                    # Expo Router screens
├── _layout.tsx         # Root layout
├── index.tsx           # Home screen
└── [feature]/          # Feature routes
    ├── index.tsx       # List screen
    └── [id].tsx        # Detail screen

e2e/                    # E2E tests
└── [feature].test.ts

scripts/                # Code generators
└── generate-*.js
```

## After Creating Files

### Component
1. Generate: `yarn generate:component UserCard`
2. Update `src/components/UserCard/types.ts` with props
3. Add logic to `src/components/UserCard/UserCard.tsx`
4. Export in `src/components/index.ts`:
   ```typescript
   export * from './UserCard';
   ```
5. Import: `import { UserCard } from '@/components';`

### Hook
1. Generate: `yarn generate:hook useAuth`
2. Update `src/hooks/useAuth/types.ts` with options/return types
3. Add logic to `src/hooks/useAuth/useAuth.ts`
4. Export in `src/hooks/index.ts`:
   ```typescript
   export * from './useAuth';
   ```
5. Import: `import { useAuth } from '@/hooks';`

### Provider
1. Generate: `yarn generate:provider Theme`
2. Update `src/providers/Theme/types.ts` with state/context types
3. Add logic to `src/providers/Theme/ThemeProvider.tsx`
4. Export in `src/providers/index.ts`:
   ```typescript
   export * from './Theme';
   ```
5. Wrap app in `app/_layout.tsx`:
   ```typescript
   import { ThemeProvider } from '@/providers';

   export default function RootLayout() {
     return (
       <ThemeProvider>
         {/* App content */}
       </ThemeProvider>
     );
   }
   ```
6. Use in components:
   ```typescript
   import { useTheme } from '@/providers';

   function MyComponent() {
     const { value, updateValue } = useTheme();
     // Use theme
   }
   ```

## Troubleshooting

### Metro Bundler Issues
```bash
yarn start --clear
```

### TypeScript Errors
```bash
yarn type-check
```

### iOS Build Issues
```bash
cd ios && pod install && cd ..
```

### Android Build Issues
```bash
cd android && ./gradlew clean && cd ..
```

### API Generation Fails
- Check internet connection
- Verify BFF URL is accessible
- Check `orval.config.ts` configuration

## Documentation

- [README.md](./README.md) - Main documentation
- [SETUP.md](./SETUP.md) - Setup and troubleshooting guide
- [GENERATORS.md](./GENERATORS.md) - Complete generators documentation
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Architecture overview
