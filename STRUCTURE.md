# Project Structure

## Folder-Based Pattern

This project follows a **folder-based pattern** where each piece of code (component, hook, store) lives in its own folder containing:

- **Implementation file** - The actual code
- **Types file** - TypeScript type definitions (if needed)
- **Index file** - Barrel export
- **Test file** - Unit tests

This pattern ensures consistency, makes code easier to find, and keeps related files together.

## Structure Overview

```
src/
├── api/                          # API client (singleton pattern)
│   ├── client.ts                 # Axios instance
│   ├── query-client.ts           # React Query config
│   ├── index.ts                  # Barrel export
│   └── generated/                # Auto-generated API code
│
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx        # Component implementation
│   │   │   ├── types.ts          # Props interface
│   │   │   ├── index.ts          # Barrel export
│   │   │   └── Button.test.tsx   # Component tests
│   │   ├── Card/
│   │   ├── Text/
│   │   └── Input/
│   ├── ProductCard/              # Feature component
│   │   ├── ProductCard.tsx
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── ProductCard.test.tsx
│   └── index.ts                  # Barrel export for all components
│
├── hooks/                        # Custom React hooks
│   ├── useDebounce/
│   │   ├── useDebounce.ts        # Hook implementation
│   │   ├── index.ts              # Barrel export
│   │   └── useDebounce.test.ts   # Hook tests
│   ├── useToggle/
│   │   ├── useToggle.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── useToggle.test.ts
│   └── index.ts                  # Barrel export for all hooks
│
├── store/                        # Zustand stores
│   ├── useAuthStore/
│   │   ├── useAuthStore.ts       # Store implementation
│   │   ├── types.ts              # State types
│   │   ├── index.ts              # Barrel export
│   │   └── useAuthStore.test.ts  # Store tests
│   └── index.ts                  # Barrel export for all stores
│
├── providers/                    # Context providers
│   ├── ThemeProvider/            # Example provider structure
│   │   ├── context.ts            # React Context
│   │   ├── ThemeProvider.tsx     # Provider component
│   │   ├── useTheme.ts           # Custom hook
│   │   ├── types.ts              # Type definitions
│   │   ├── index.ts              # Barrel export
│   │   └── ThemeProvider.test.tsx
│   └── index.ts
│
├── types/                        # Shared TypeScript types
│   └── index.ts
│
├── utils/                        # Utility functions
│   └── index.ts
│
└── constants/                    # App constants
    └── index.ts

app/                              # Expo Router screens
├── _layout.tsx                   # Root layout
├── index.tsx                     # Home screen
└── [feature]/                    # Feature routes
    ├── index.tsx
    └── [id].tsx

e2e/                              # Detox E2E tests
└── *.test.ts

scripts/                          # Code generators
├── generate-component.js
├── generate-hook.js
└── generate-provider.js
```

## File Naming Conventions

### Components
```
ComponentName/
├── ComponentName.tsx      # PascalCase, matches folder name
├── types.ts               # Always "types.ts"
├── index.ts               # Always "index.ts"
└── ComponentName.test.tsx # Matches component file name + .test
```

### Hooks
```
useHookName/
├── useHookName.ts         # camelCase with "use" prefix
├── types.ts               # Optional, if hook has complex types
├── index.ts               # Always "index.ts"
└── useHookName.test.ts    # Matches hook file name + .test
```

### Providers
```
ProviderName/
├── context.ts                    # Always "context.ts"
├── ProviderNameProvider.tsx      # PascalCase + "Provider"
├── useProviderName.ts            # "use" + provider name
├── types.ts                      # Always "types.ts"
├── index.ts                      # Always "index.ts"
└── ProviderNameProvider.test.tsx # Matches provider file + .test
```

### Stores
```
useStoreName/
├── useStoreName.ts        # camelCase with "use" prefix
├── types.ts               # State and store types
├── index.ts               # Always "index.ts"
└── useStoreName.test.ts   # Matches store file name + .test
```

## Import Patterns

### With Barrel Exports

```typescript
// ✅ Good - Import from barrel exports
import { Button, Card, Text, Input } from '@/components/ui';
import { ProductCard } from '@/components';
import { useDebounce, useToggle } from '@/hooks';
import { useAuthStore } from '@/store';
import { COLORS, SPACING } from '@/constants';
import { formatDate } from '@/utils';

// ❌ Bad - Direct imports bypass barrel exports
import { Button } from '@/components/ui/Button/Button';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
```

### Types

```typescript
// ✅ Good - Types exported from barrel
import { ButtonProps, ButtonVariant } from '@/components/ui';
import { User, AuthState } from '@/store';

// Also works
import type { ButtonProps } from '@/components/ui';
```

## Adding New Code

### Using Generators (Recommended)

```bash
# Generate component
yarn generate:component UserProfile

# Generate hook
yarn generate:hook useAuth

# Generate provider
yarn generate:provider Theme
```

### Manual Creation

If creating manually, follow this structure:

1. Create folder: `src/[category]/[Name]/`
2. Create implementation file
3. Create `types.ts` (if needed)
4. Create `index.ts` with exports
5. Create test file
6. Update parent `index.ts` barrel export

## Barrel Exports

Each module has an `index.ts` file that exports everything:

```typescript
// src/components/ui/Button/index.ts
export * from './Button';
export * from './types';

// src/components/ui/index.ts
export * from './Button';
export * from './Card';
export * from './Text';
export * from './Input';

// src/components/index.ts
export * from './ui';
export * from './ProductCard';
```

This allows clean imports:
```typescript
import { Button, Card } from '@/components/ui';
```

## Benefits of This Structure

1. **Co-location** - Related files are together
2. **Consistency** - Every module follows same pattern
3. **Discoverability** - Easy to find all files for a feature
4. **Scalability** - Add new modules without changing structure
5. **Testing** - Tests live next to implementation
6. **Types** - Type definitions are separate and clear
7. **Tree-shaking** - Barrel exports work well with bundlers
8. **Generators** - Automated scaffolding ensures consistency

## Migration Notes

The project has been fully migrated to this structure:

- ✅ All UI components (`Button`, `Card`, `Text`, `Input`)
- ✅ All feature components (`ProductCard`)
- ✅ All hooks (`useDebounce`, `useToggle`)
- ✅ All stores (`useAuthStore`)
- ✅ Barrel exports updated
- ✅ Path aliases configured

## Testing

Tests are co-located with their implementation:

```typescript
// Component test
src/components/Button/Button.test.tsx

// Hook test
src/hooks/useAuth/useAuth.test.ts

// Store test
src/store/useAuthStore/useAuthStore.test.ts
```

Run tests:
```bash
yarn test                    # All tests
yarn test Button.test        # Specific test
yarn test:watch              # Watch mode
```

## Code Generation

See [GENERATORS.md](./GENERATORS.md) for detailed information on using the code generators to maintain this structure automatically.
