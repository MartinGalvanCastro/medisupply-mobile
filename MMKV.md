# MMKV Storage

This project uses **MMKV** (an efficient, small mobile key-value storage framework created by WeChat) for fast, persistent storage on device disk, integrated with Zustand for state management.

## Features

- ✅ **Lightning fast** - 10x faster than AsyncStorage
- ✅ **Zustand integration** - Persist any Zustand store to disk
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Encrypted** - Optional encryption support
- ✅ **Small footprint** - Minimal storage overhead
- ✅ **Cross-platform** - Works on iOS and Android
- ✅ **Synchronous API** - No async/await needed
- ✅ **Multiple data types** - Strings, numbers, booleans, objects

## Installation

Already installed in this project:

```json
{
  "dependencies": {
    "react-native-mmkv": "^3.1.0"
  }
}
```

## Project Structure

```
src/utils/storage/
├── storage.ts              # MMKV instance and utility functions
├── types.ts                # Storage type definitions
├── zustand-mmkv.ts         # Zustand persistence adapter
├── storage.test.ts         # Tests
└── index.ts                # Barrel export
```

## Basic Usage

### Direct Storage Access

```typescript
import { mmkvStorage, StorageKeys } from '@/utils/storage';

// Set a string
mmkvStorage.setItem('key', 'value');

// Get a string
const value = mmkvStorage.getItem('key');

// Set an object (automatically stringified)
mmkvStorage.setObject('user', { name: 'John', age: 30 });

// Get an object (automatically parsed)
const user = mmkvStorage.getObject<User>('user');

// Set a boolean
mmkvStorage.setBoolean('isDarkMode', true);

// Get a boolean
const isDarkMode = mmkvStorage.getBoolean('isDarkMode');

// Set a number
mmkvStorage.setNumber('count', 42);

// Get a number
const count = mmkvStorage.getNumber('count');

// Remove an item
mmkvStorage.removeItem('key');

// Check if key exists
if (mmkvStorage.has('key')) {
  // ...
}

// Clear all storage
mmkvStorage.clearAll();

// Get all keys
const keys = mmkvStorage.getAllKeys();
```

### Predefined Storage Keys

Use predefined keys for consistency:

```typescript
import { StorageKeys } from '@/utils/storage';

// Available keys
StorageKeys.AUTH_TOKEN;          // 'auth_token'
StorageKeys.USER_DATA;           // 'user_data'
StorageKeys.LANGUAGE;            // 'language'
StorageKeys.THEME;               // 'theme'
StorageKeys.ONBOARDING_COMPLETED;// 'onboarding_completed'
StorageKeys.LAST_SYNC;           // 'last_sync'

// Usage
mmkvStorage.setItem(StorageKeys.AUTH_TOKEN, token);
const token = mmkvStorage.getItem(StorageKeys.AUTH_TOKEN);
```

## Zustand Integration

### Creating a Persisted Store with Selective Persistence

**⚠️ Important: Only persist what you need!**

Use `partialize` to specify exactly which fields to save to disk:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

interface CounterState {
  // Persisted data
  count: number;
  savedValue: number;

  // Temporary data (not persisted)
  isLoading: boolean;
  lastUpdate: string | null;

  // Actions
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set) => ({
      count: 0,
      savedValue: 0,
      isLoading: false,
      lastUpdate: null,

      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'counter-storage',
      storage: createJSONStorage(() => zustandStorage),

      // ✅ IMPORTANT: Only persist specific fields
      partialize: (state) => ({
        count: state.count,
        savedValue: state.savedValue,
        // isLoading is NOT persisted (temporary UI state)
        // lastUpdate is NOT persisted (temporary data)
        // Actions are NEVER persisted
      }),
    }
  )
);
```

### Using the Persisted Store

```typescript
import { useCounterStore } from '@/store';

function CounterComponent() {
  const { count, increment, decrement } = useCounterStore();

  return (
    <VStack>
      <Text>Count: {count}</Text>
      <Button onPress={increment}>
        <ButtonText>Increment</ButtonText>
      </Button>
      <Button onPress={decrement}>
        <ButtonText>Decrement</ButtonText>
      </Button>
    </VStack>
  );
}
```

The state automatically persists to disk and survives app restarts!

## Existing Persisted Stores

### useAuthStore

Authentication state with persistence:

```typescript
import { useAuthStore } from '@/store';

function LoginScreen() {
  const { user, token, setUser, setToken, logout } = useAuthStore();

  const handleLogin = async () => {
    const response = await loginAPI();
    setUser(response.user);
    setToken(response.token);
    // Automatically saved to disk!
  };

  const handleLogout = () => {
    logout();
    // Automatically removed from disk!
  };

  // On app restart, user will still be logged in
  if (user) {
    return <Text>Welcome back, {user.name}!</Text>;
  }

  return <LoginForm onSubmit={handleLogin} />;
}
```

**Persisted fields (using `partialize`):**
- ✅ `user` - User data (id, email, name)
- ✅ `token` - Auth token

**NOT persisted:**
- ❌ `isAuthenticated` - Recomputed from user presence (no need to store)

### useSettingsStore

App settings with persistence:

```typescript
import { useSettingsStore } from '@/store';

function SettingsScreen() {
  const {
    theme,
    notificationsEnabled,
    hasCompletedOnboarding,
    setTheme,
    setNotificationsEnabled,
    setHasCompletedOnboarding,
  } = useSettingsStore();

  return (
    <VStack space="md">
      {/* Theme selector */}
      <Select value={theme} onValueChange={setTheme}>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </Select>

      {/* Notifications toggle */}
      <Switch
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
      />

      {/* All settings persist automatically! */}
    </VStack>
  );
}
```

**Persisted fields (using `partialize`):**
- ✅ `theme` - Theme mode ('light' | 'dark' | 'system')
- ✅ `notificationsEnabled` - Notification preference
- ✅ `hasCompletedOnboarding` - Onboarding status

**NOT persisted:**
- ❌ `lastSyncDate` - Temporary runtime data (shouldn't persist across restarts)

## Advanced Usage

### Why Use Selective Persistence?

**✅ Always use `partialize` to control what gets saved:**

1. **Performance** - Only save what's needed (smaller storage, faster reads/writes)
2. **Security** - Don't persist sensitive temporary data
3. **Clarity** - Explicitly document what persists vs what doesn't
4. **Bugs prevention** - Avoid stale data on app restart

### Selective Persistence Pattern

```typescript
interface MyState {
  // User preferences (SHOULD persist)
  theme: 'light' | 'dark';
  fontSize: number;

  // Temporary UI state (should NOT persist)
  isLoading: boolean;
  currentPage: number;
  searchQuery: string;

  // Sensitive data (should NOT persist)
  temporaryToken: string | null;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 16,
      isLoading: false,
      currentPage: 1,
      searchQuery: '',
      temporaryToken: null,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'my-storage',
      storage: createJSONStorage(() => zustandStorage),

      // ✅ ONLY persist user preferences
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        // Everything else is NOT persisted
      }),
    }
  )
);
```

### Migration Between Versions

Handle breaking changes in persisted state:

```typescript
export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      // ... state
    }),
    {
      name: 'my-storage',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migrate from version 0 to 1
          persistedState.newField = 'default';
          delete persistedState.oldField;
        }
        return persistedState;
      },
    }
  )
);
```

### Hydration Check

Wait for hydration before rendering:

```typescript
import { useEffect, useState } from 'react';

function App() {
  const [hydrated, setHydrated] = useState(false);
  const hasCompletedOnboarding = useSettingsStore(
    (state) => state.hasCompletedOnboarding
  );

  useEffect(() => {
    // Wait for Zustand to rehydrate from storage
    const unsubscribe = useSettingsStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsubscribe;
  }, []);

  if (!hydrated) {
    return <LoadingScreen />;
  }

  return hasCompletedOnboarding ? <HomeScreen /> : <OnboardingScreen />;
}
```

## Storage Utilities

### Check Storage Size

```typescript
import { storage } from '@/utils/storage';

// Get all keys
const keys = storage.getAllKeys();

// Calculate approximate size
let totalSize = 0;
keys.forEach((key) => {
  const value = storage.getString(key);
  if (value) {
    totalSize += value.length;
  }
});

console.log(`Storage size: ${totalSize} bytes`);
```

### Clear Specific Store

```typescript
import { useAuthStore, useSettingsStore } from '@/store';

// Clear auth store (also clears MMKV)
useAuthStore.getState().logout();

// Or manually clear from MMKV
import { mmkvStorage } from '@/utils/storage';
mmkvStorage.removeItem('auth-storage');
```

### Debug Storage

```typescript
import { storage } from '@/utils/storage';

// Log all stored data (development only!)
if (__DEV__) {
  const keys = storage.getAllKeys();
  console.log('=== MMKV Storage ===');
  keys.forEach((key) => {
    const value = storage.getString(key);
    console.log(`${key}:`, value);
  });
}
```

## Best Practices

### 1. Always Use `partialize` for Zustand Stores

```typescript
// ✅ Good - explicitly control what persists
persist(
  (set) => ({ /* state */ }),
  {
    name: 'my-store',
    storage: createJSONStorage(() => zustandStorage),
    partialize: (state) => ({
      userPreference: state.userPreference,
      // Only what you need!
    }),
  }
)

// ❌ Bad - persists everything (includes temporary state, actions, etc.)
persist(
  (set) => ({ /* state */ }),
  {
    name: 'my-store',
    storage: createJSONStorage(() => zustandStorage),
    // No partialize = everything gets saved!
  }
)
```

### 2. Use Predefined Keys

```typescript
// ✅ Good - use predefined keys
mmkvStorage.setItem(StorageKeys.AUTH_TOKEN, token);

// ❌ Bad - magic strings
mmkvStorage.setItem('token', token);
```

### 3. Type Your Objects

```typescript
// ✅ Good - typed object
interface User {
  id: string;
  name: string;
}
const user = mmkvStorage.getObject<User>('user');

// ❌ Bad - untyped
const user = mmkvStorage.getObject('user');
```

### 4. Handle Missing Values

```typescript
// ✅ Good - check for undefined
const token = mmkvStorage.getItem(StorageKeys.AUTH_TOKEN);
if (token) {
  // Use token
}

// ❌ Bad - assume it exists
const token = mmkvStorage.getItem(StorageKeys.AUTH_TOKEN)!;
```

### 5. Don't Store Sensitive Data

```typescript
// ❌ Bad - don't store passwords or sensitive keys in plain text
mmkvStorage.setItem('password', password);

// ✅ Good - use encryption or secure storage
// For highly sensitive data, consider react-native-keychain
import * as Keychain from 'react-native-keychain';
await Keychain.setGenericPassword('username', password);
```

### 6. Limit Storage Size

```typescript
// ✅ Good - store only necessary data
mmkvStorage.setObject('userProfile', {
  id: user.id,
  name: user.name,
  email: user.email,
});

// ❌ Bad - storing large objects
mmkvStorage.setObject('allProducts', products); // Could be megabytes!
```

## Encryption

MMKV supports encryption. Update the encryption key in `src/utils/storage/storage.ts`:

```typescript
export const storage = new MMKV({
  id: 'medisupply-storage',
  encryptionKey: 'your-secure-encryption-key-here', // Use env variable or keychain
});
```

**⚠️ Important**: Store encryption keys securely, not in the code!

```typescript
// Better approach - get key from secure storage
import * as Keychain from 'react-native-keychain';

const credentials = await Keychain.getGenericPassword();
const encryptionKey = credentials ? credentials.password : generateNewKey();

export const storage = new MMKV({
  id: 'medisupply-storage',
  encryptionKey,
});
```

## Multiple Storage Instances

Create separate storage instances for different purposes:

```typescript
import { MMKV } from 'react-native-mmkv';

// Default storage
export const storage = new MMKV({ id: 'medisupply-storage' });

// Cache storage (can be cleared separately)
export const cacheStorage = new MMKV({ id: 'medisupply-cache' });

// Secure storage (encrypted)
export const secureStorage = new MMKV({
  id: 'medisupply-secure',
  encryptionKey: getEncryptionKey(),
});
```

## Troubleshooting

### Storage Not Persisting

1. **Check store name**: Each store needs a unique `name` in persist config
2. **Check imports**: Ensure you're importing `zustandStorage` correctly
3. **Check platform**: MMKV works on iOS/Android, not on web

### Migration Errors

```typescript
// Clear storage if migration fails (development only)
if (__DEV__) {
  useMyStore.persist.clearStorage();
}
```

### Testing

Mock MMKV in tests:

```typescript
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));
```

## Performance

MMKV is extremely fast:

| Operation | MMKV | AsyncStorage |
|-----------|------|--------------|
| Write | ~0.01ms | ~2-10ms |
| Read | ~0.01ms | ~2-10ms |
| Large data | ✅ Fast | ❌ Slow |

## Comparison with AsyncStorage

| Feature | MMKV | AsyncStorage |
|---------|------|--------------|
| Speed | 10-100x faster | Slower |
| Synchronous | ✅ Yes | ❌ No |
| TypeScript | ✅ Built-in | ⚠️ Limited |
| Encryption | ✅ Built-in | ❌ No |
| Size limit | Large | ~6MB |
| Bundle size | ~30KB | Built-in |

## Resources

- [MMKV GitHub](https://github.com/mrousavy/react-native-mmkv)
- [MMKV Documentation](https://github.com/mrousavy/react-native-mmkv#readme)
- [Zustand Persist](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

## Summary

- ✅ MMKV setup complete with Zustand integration
- ✅ Storage utilities for all data types
- ✅ Predefined storage keys
- ✅ Auth store persisted automatically
- ✅ Settings store persisted automatically
- ✅ Type-safe storage API
- ✅ Production-ready configuration
- ✅ Easy to create new persisted stores

Use MMKV for all persistent storage needs - it's fast, reliable, and type-safe!
