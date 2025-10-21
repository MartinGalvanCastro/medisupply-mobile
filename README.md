# MediSupply Mobile

A modern React Native mobile application built with Expo, TypeScript, and best practices including barrel exports, API code generation, and E2E testing.

## Features

- **Expo Router** - File-based routing with type safety
- **TypeScript** - Full type safety across the application
- **Gluestack UI** - Universal UI component library for consistent design
- **Internationalization (i18n)** - Multi-language support with i18next
- **OpenAPI Codegen** - Auto-generated API client with React Query hooks using Orval
- **Zustand** - Lightweight state management with MMKV persistence
- **MMKV Storage** - Fast, efficient key-value storage for persisting data to disk
- **Detox** - E2E testing for iOS and Android
- **EAS Build** - Create installable iOS and Android apps for testing
- **Pre-commit Hooks** - Husky + lint-staged for automatic code quality checks
- **Prettier** - Consistent code formatting across the project
- **GitHub Actions** - CI/CD pipeline for testing and builds
- **Barrel Exports** - Clean imports throughout the codebase
- **Code Generators** - Auto-generate components, hooks, and providers with tests
- **Folder-Based Structure** - Each module in its own folder with types, tests, and exports

## Project Structure

This project follows a **folder-based pattern** where each component, hook, and store lives in its own folder with its implementation, types, tests, and barrel exports.

```
medisupply-mobile/
├── app/                           # Expo Router pages
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Home screen
│   └── products/                 # Products feature
├── src/
│   ├── api/                      # API client and configuration
│   │   ├── client.ts             # Axios instance
│   │   ├── query-client.ts       # React Query config
│   │   └── generated/            # Auto-generated API code
│   ├── components/               # Reusable components
│   │   ├── ui/
│   │   │   ├── Button/           # Each component in its own folder
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── types.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Card/
│   │   │   ├── Text/
│   │   │   └── Input/
│   │   └── ProductCard/
│   ├── hooks/                    # Custom hooks (folder-based)
│   │   ├── useDebounce/
│   │   │   ├── useDebounce.ts
│   │   │   ├── index.ts
│   │   │   └── useDebounce.test.ts
│   │   └── useToggle/
│   ├── store/                    # Zustand stores (folder-based)
│   │   └── useAuthStore/
│   │       ├── useAuthStore.ts
│   │       ├── types.ts
│   │       ├── index.ts
│   │       └── useAuthStore.test.ts
│   ├── providers/                # Context providers
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Utility functions
│   └── constants/                # App constants
├── e2e/                          # Detox E2E tests
├── scripts/                      # Code generators
└── .github/workflows/            # CI/CD pipelines
```

See [STRUCTURE.md](./STRUCTURE.md) for detailed structure documentation.

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn (Corepack enabled)
- iOS: Xcode and CocoaPods
- Android: Android Studio and JDK 17

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Generate API client from OpenAPI spec:
```bash
yarn generate:api
```

### Code Generators

Generate boilerplate code for new components, hooks, and providers:

```bash
# Generate a new component with folder structure and tests
yarn generate:component UserCard

# Generate a custom hook with types and tests
yarn generate:hook useAuth

# Generate a Context provider with separate files
yarn generate:provider Theme
```

See [GENERATORS.md](./GENERATORS.md) for detailed documentation.

### UI Components

The project uses Gluestack UI for all basic UI components:

```typescript
import { Box, Button, ButtonText, Card, Heading, Text } from '@/components/ui';

function MyScreen() {
  return (
    <Box p="$4">
      <Card size="md" variant="elevated">
        <Heading size="xl">Title</Heading>
        <Text>Description</Text>
        <Button>
          <ButtonText>Action</ButtonText>
        </Button>
      </Card>
    </Box>
  );
}
```

See [GLUESTACK.md](./GLUESTACK.md) for complete Gluestack UI documentation.

### Internationalization

The app supports multiple languages (English and Spanish included):

```typescript
import { useTranslation } from '@/i18n';

function MyScreen() {
  const { t } = useTranslation();

  return (
    <Box>
      <Heading>{t('home.title')}</Heading>
      <Text>{t('home.subtitle')}</Text>
    </Box>
  );
}
```

See [I18N.md](./I18N.md) for complete internationalization documentation.

### Persistent Storage

The app uses MMKV for fast, persistent storage integrated with Zustand:

```typescript
import { useAuthStore, useSettingsStore } from '@/store';
import { mmkvStorage, StorageKeys } from '@/utils/storage';

// Use persisted Zustand stores
function MyComponent() {
  const { user, setUser } = useAuthStore(); // Automatically persisted!
  const { theme, setTheme } = useSettingsStore(); // Automatically persisted!

  // Or use storage directly
  mmkvStorage.setItem(StorageKeys.AUTH_TOKEN, token);
  const token = mmkvStorage.getItem(StorageKeys.AUTH_TOKEN);
}
```

**Built-in persisted stores:**
- `useAuthStore` - Authentication state (user, token)
- `useSettingsStore` - App settings (theme, notifications, onboarding)

See [MMKV.md](./MMKV.md) for complete storage documentation.

### Development

Start the Expo development server:
```bash
yarn start
```

Run on specific platforms:
```bash
yarn ios
yarn android
yarn web
```

### Code Quality

The project uses **Husky pre-commit hooks** to automatically check code quality before every commit.

**Automatic checks on commit:**
- ✅ ESLint (code linting and auto-fix)
- ✅ Prettier (code formatting)
- ✅ Only runs on staged files (fast!)

**Manual commands:**

```bash
# Lint check
yarn lint

# Lint and auto-fix
yarn lint:fix

# Format check
yarn format:check

# Format and auto-fix
yarn format

# Type check
yarn type-check
```

**First time setup:**
```bash
yarn install  # Installs dependencies
yarn prepare  # Sets up Husky hooks
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for complete pre-commit hooks documentation.

### Building Installable Apps

Build installable test apps for iOS and Android devices:

```bash
# Build for iOS (creates .ipa file)
yarn build:ios

# Build for Android (creates .apk file)
yarn build:android

# Build for both platforms
yarn build:all
```

The builds are created using **Expo EAS Build** and can be installed on real devices for testing without publishing to app stores.

**Quick start:**
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `yarn build:android` (easiest to test)
4. Install the APK on your Android device or .ipa on your iPhone

See [BUILDS.md](./BUILDS.md) for complete build and distribution documentation.

### Testing

#### Unit Tests
```bash
yarn test
yarn test:watch
```

#### E2E Tests

**iOS:**
```bash
# Build the app
yarn test:e2e:build:ios

# Run tests
yarn test:e2e:ios
```

**Android:**
```bash
# Build the app
yarn test:e2e:build:android

# Run tests
yarn test:e2e:android
```

## API Integration

The app uses Orval to generate a type-safe API client from the BFF OpenAPI specification.

### Regenerate API Client

```bash
yarn generate:api
```

This will:
1. Fetch the latest OpenAPI spec from `https://bffproyecto.juanandresdeveloper.com/bff/openapi.json`
2. Generate TypeScript types and models
3. Create React Query hooks for all endpoints
4. Split code by OpenAPI tags for better organization

### Using Generated Hooks

```typescript
import { useGetProducts } from '@/api/generated/products';

function ProductList() {
  const { data, isLoading, error } = useGetProducts({
    limit: 10,
    offset: 0,
  });

  // Use the data...
}
```

## Barrel Exports

The project uses barrel exports (index.ts files) for cleaner imports:

```typescript
// Instead of:
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// You can write:
import { Button, Card } from '@/components/ui';
```

## CI/CD

The project includes three GitHub Actions workflows:

### CI Workflow
- Runs on push and PR
- Linting and type checking
- Unit tests
- E2E tests (iOS and Android)

### Build Workflow
- Runs on push to main
- Builds production iOS and Android apps via EAS

### API Codegen Workflow
- Runs daily at 2 AM UTC
- Checks for API changes
- Auto-creates PR if changes detected

## Environment Variables

Create a `.env` file for local development:

```bash
API_BASE_URL=https://bffproyecto.juanandresdeveloper.com
```

## Best Practices

1. **Use TypeScript strictly** - No `any` types
2. **Barrel exports** - Export through index.ts files
3. **Functional components** - Use hooks instead of class components
4. **Custom hooks** - Extract reusable logic
5. **Zustand for state** - Global state management with MMKV persistence
6. **React Query for API** - Server state management
7. **MMKV for storage** - Fast persistent storage for user data
8. **Code formatting** - Prettier runs automatically on commit
9. **Code linting** - ESLint checks run automatically on commit
10. **Test IDs** - Add testID props for Detox tests

## Architecture Decisions

- **Expo Router**: Chosen for file-based routing and better DX
- **Orval**: Generates React Query hooks directly from OpenAPI
- **Zustand**: Lightweight alternative to Redux for client state
- **MMKV**: 10x faster than AsyncStorage for persistent storage
- **Detox**: Industry standard for React Native E2E testing
- **Husky + lint-staged**: Automatic code quality checks on commit
- **Prettier**: Consistent code formatting across team
- **Yarn with Corepack**: Modern package management

## Contributing

1. Create a feature branch
2. Make your changes
3. Stage and commit (pre-commit hooks run automatically)
4. Ensure tests pass: `yarn test`
5. Create a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines, code style, and pre-commit hooks documentation.

## License

MIT
