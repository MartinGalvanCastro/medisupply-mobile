# MediSupply Mobile - Setup Guide

This guide covers all the libraries and configurations set up in this project.

## 📦 Installed Dependencies

### State Management
- **zustand** (5.0.8) - Lightweight state management
- **react-native-mmkv** (4.0.0) - Fast, encrypted key-value storage

### Data Fetching
- **@tanstack/react-query** (5.90.5) - Powerful async state management
- **axios** (1.12.2) - HTTP client for API requests

### Internationalization (i18n)
- **i18next** (25.6.0) - Internationalization framework
- **react-i18next** (16.2.0) - React bindings for i18next
- **expo-localization** (17.0.7) - Device locale detection

### API Code Generation
- **orval** (7.15.0) - Generate TypeScript API client from OpenAPI specs

### Testing
- **jest** (30.2.0) - Testing framework
- **@testing-library/react-native** (13.3.3) - React Native testing utilities
- **ts-jest** (29.4.5) - TypeScript preprocessor for Jest

## 🏗️ Project Structure

```
src/
├── api/                    # API client and configuration
│   ├── client.ts          # Axios instance with interceptors
│   ├── query-client.ts    # React Query client configuration
│   ├── index.ts           # Barrel export
│   └── generated/         # Auto-generated API code (from Orval)
│
├── providers/             # React context providers
│   ├── QueryClientProvider/
│   │   ├── QueryClientProvider.tsx
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── QueryClientProvider.test.tsx
│   ├── I18nProvider/
│   │   ├── I18nProvider.tsx
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── I18nProvider.test.tsx
│   └── index.ts
│
├── i18n/                  # Internationalization
│   ├── config/
│   │   ├── i18n.config.ts
│   │   └── index.ts
│   ├── locales/
│   │   ├── en.ts          # English translations
│   │   ├── es.ts          # Spanish translations
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useTranslation.ts
│   │   ├── useTranslation.test.ts
│   │   ├── useLanguage.ts
│   │   ├── useLanguage.test.ts
│   │   └── index.ts
│   └── index.ts
│
├── store/                 # Zustand stores
│   ├── useAuthStore/
│   │   ├── useAuthStore.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── useAuthStore.test.ts
│   ├── useSettingsStore/
│   │   ├── useSettingsStore.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   └── useSettingsStore.test.ts
│   └── index.ts
│
└── utils/                 # Utility functions
    ├── storage/
    │   ├── storage.ts     # MMKV storage wrapper
    │   ├── zustand-mmkv.ts # Zustand MMKV adapter
    │   ├── types.ts
    │   ├── storage.test.ts
    │   ├── zustand-mmkv.test.ts
    │   └── index.ts
    └── index.ts
```

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 2. Generate API Client

Make sure your backend server is running at `http://localhost:8000`, then run:

```bash
yarn api:generate
```

This will:
- Fetch the OpenAPI spec from `http://localhost:8000/openapi.json`
- Generate TypeScript types and React Query hooks in `src/api/generated`

To watch for changes and regenerate automatically:

```bash
yarn api:watch
```

### 3. Update App Root

Wrap your app with the providers in `app/_layout.tsx`:

```tsx
import { QueryClientProvider } from '@/providers/QueryClientProvider';
import { I18nProvider } from '@/providers/I18nProvider';

export default function RootLayout() {
  return (
    <QueryClientProvider>
      <I18nProvider>
        {/* Your app content */}
      </I18nProvider>
    </QueryClientProvider>
  );
}
```

## 📖 Usage Examples

### State Management with Zustand + MMKV

```tsx
import { useAuthStore } from '@/store';

function LoginScreen() {
  const { login, user, isAuthenticated } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    // Call your API
    const { user, token } = await loginApi(email, password);

    // Update store (automatically persisted to MMKV)
    login(user, token);
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.name}</Text>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </View>
  );
}
```

### Data Fetching with React Query

After generating the API client, you can use the auto-generated hooks:

```tsx
import { useGetProducts } from '@/api/generated/products';

function ProductList() {
  const { data, isLoading, error } = useGetProducts();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}
```

### Internationalization

```tsx
import { useTranslation, useLanguage } from '@/i18n';

function SettingsScreen() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <View>
      <Text>{t('common.loading')}</Text>
      <Button
        title={currentLanguage === 'en' ? 'Español' : 'English'}
        onPress={() => changeLanguage(currentLanguage === 'en' ? 'es' : 'en')}
      />
    </View>
  );
}
```

### Direct Storage Access

```tsx
import { storageUtils } from '@/utils';

// Store string
storageUtils.setString('key', 'value');

// Store object
storageUtils.setObject('user', { id: 1, name: 'John' });

// Retrieve
const user = storageUtils.getObject<User>('user');

// Check existence
if (storageUtils.contains('key')) {
  // Key exists
}

// Clear all
storageUtils.clearAll();
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Coverage Requirements

The project is configured for **95% code coverage** across:
- Branches
- Functions
- Lines
- Statements

### Writing Tests

Example test structure:

```tsx
import { renderHook, act } from '@testing-library/react-native';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should do something', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.action();
    });

    expect(result.current.state).toBe(expectedValue);
  });
});
```

## 🔧 Available Scripts

```bash
# Development
yarn start              # Start Expo dev server
yarn android           # Start on Android
yarn ios              # Start on iOS
yarn web              # Start on web

# API Code Generation
yarn api:generate     # Generate API client from OpenAPI spec
yarn api:watch       # Watch for changes and regenerate

# Testing
yarn test            # Run tests
yarn test:watch     # Run tests in watch mode
yarn test:coverage  # Run tests with coverage report
```

## 🔐 Security

### MMKV Encryption

Update the encryption key in `src/utils/storage/storage.ts`:

```typescript
export const mmkvStorage = new MMKV({
  id: 'medisupply-storage',
  encryptionKey: process.env.MMKV_ENCRYPTION_KEY, // Use env variable
});
```

### API Authentication

The axios client is configured with interceptors for authentication. Update `src/api/client.ts`:

```typescript
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📝 Adding New Features

### Creating a New Store

1. Create a new folder: `src/store/useMyStore/`
2. Create files:
   - `useMyStore.ts` - Store implementation
   - `types.ts` - TypeScript types
   - `index.ts` - Barrel export
   - `useMyStore.test.ts` - Unit tests

Example store template:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

interface MyState {
  // Define state
}

interface MyActions {
  // Define actions
}

type MyStore = MyState & MyActions;

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      // Initial state
      // Actions
    }),
    {
      name: 'my-store-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
```

### Adding Translations

1. Update `src/i18n/locales/en.ts`:
```typescript
export const en = {
  common: {
    // existing...
    newKey: 'New translation',
  },
};
```

2. Update `src/i18n/locales/es.ts`:
```typescript
export const es: TranslationKeys = {
  common: {
    // existing...
    newKey: 'Nueva traducción',
  },
};
```

## 🐛 Troubleshooting

### Path Alias Not Working

Make sure your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And `babel.config.js` has:
```javascript
plugins: [
  [
    'module-resolver',
    {
      alias: {
        '@': './src',
      },
    },
  ],
],
```

### MMKV Not Persisting

Ensure you're using `createJSONStorage` wrapper:
```typescript
storage: createJSONStorage(() => zustandStorage)
```

### API Generation Fails

1. Check your backend is running at `http://localhost:8000`
2. Verify the OpenAPI endpoint: `http://localhost:8000/openapi.json`
3. Update `orval.config.ts` with the correct URL

## 📚 Additional Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [MMKV Documentation](https://github.com/mrousavy/react-native-mmkv)
- [i18next Documentation](https://www.i18next.com/)
- [Orval Documentation](https://orval.dev/)
- [Jest Documentation](https://jestjs.io/)

## ✅ Checklist

- [x] Zustand state management configured
- [x] MMKV storage integration
- [x] React Query setup
- [x] i18n configuration (EN/ES)
- [x] Orval API code generation
- [x] Jest testing framework
- [x] Example stores (Auth, Settings)
- [x] 95% test coverage setup
- [x] Path aliases configured
- [x] TypeScript strict mode enabled
