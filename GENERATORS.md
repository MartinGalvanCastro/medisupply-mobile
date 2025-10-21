# Code Generators

Automated scripts to generate boilerplate code for components, hooks, and providers with proper folder structure, TypeScript types, and test files.

## Overview

The project includes three code generators:
- **Component Generator** - Create React Native components with props and tests
- **Hook Generator** - Create custom React hooks with types and tests
- **Provider Generator** - Create Context providers with separate context file and tests

All generators follow these principles:
- ✅ Folder-based structure (one folder per component/hook/provider)
- ✅ Separate types file for clean type definitions
- ✅ Barrel exports via index.ts
- ✅ Test files with basic test cases
- ✅ TypeScript strict mode compatible
- ✅ Ready-to-use templates

---

## Component Generator

Creates a React Native component with proper structure.

### Usage

```bash
yarn generate:component ComponentName
```

### Requirements

- Component name must be in **PascalCase** (e.g., `UserCard`, `ProductList`)

### Generated Structure

```
src/components/ComponentName/
├── ComponentName.tsx          # Component implementation
├── types.ts                   # Props interface
├── index.ts                   # Barrel export
└── ComponentName.test.tsx     # Test file
```

### Example

```bash
yarn generate:component UserCard
```

**Generated files:**

**`UserCard.tsx`**
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UserCardProps } from './types';

export const UserCard: React.FC<UserCardProps> = ({
  children,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add your styles here
  },
});
```

**`types.ts`**
```typescript
import { ViewProps } from 'react-native';

export interface UserCardProps extends ViewProps {
  children?: React.ReactNode;
  testID?: string;
}
```

**`index.ts`**
```typescript
export * from './UserCard';
export * from './types';
```

**`UserCard.test.tsx`**
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

### After Generation

Add to `src/components/index.ts`:
```typescript
export * from './UserCard';
```

Now you can import:
```typescript
import { UserCard } from '@/components';
```

---

## Hook Generator

Creates a custom React hook with types and tests.

### Usage

```bash
yarn generate:hook useHookName
```

### Requirements

- Hook name must start with **"use"** and be in **camelCase** (e.g., `useAuth`, `useFetch`)

### Generated Structure

```
src/hooks/useHookName/
├── useHookName.ts           # Hook implementation
├── types.ts                 # Options and return types
├── index.ts                 # Barrel export
└── useHookName.test.ts      # Test file
```

### Example

```bash
yarn generate:hook useAuth
```

**Generated files:**

**`useAuth.ts`**
```typescript
import { useState, useEffect } from 'react';
import { useAuthOptions, useAuthReturn } from './types';

export const useAuth = (options?: useAuthOptions): useAuthReturn => {
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Hook logic here
  }, [options]);

  const reset = () => {
    setValue('');
    setError(null);
  };

  return {
    value,
    loading,
    error,
    reset,
  };
};
```

**`types.ts`**
```typescript
export interface useAuthOptions {
  initialValue?: string;
}

export interface useAuthReturn {
  value: string;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}
```

### After Generation

Add to `src/hooks/index.ts`:
```typescript
export * from './useAuth';
```

Now you can import:
```typescript
import { useAuth } from '@/hooks';
```

---

## Provider Generator

Creates a Context Provider with separate context file, provider component, custom hook, types, and tests.

### Usage

```bash
yarn generate:provider ProviderName
```

### Requirements

- Provider name must be in **PascalCase** (e.g., `Theme`, `Auth`)
- Name should NOT include "Provider" suffix (it's added automatically)

### Generated Structure

```
src/providers/ProviderName/
├── context.ts                      # React Context definition
├── ProviderNameProvider.tsx        # Provider component
├── useProviderName.ts              # Custom hook to use context
├── types.ts                        # Type definitions
├── index.ts                        # Barrel export
└── ProviderNameProvider.test.tsx   # Test file
```

### Example

```bash
yarn generate:provider Theme
```

**Generated files:**

**`context.ts`**
```typescript
import { createContext } from 'react';
import { ThemeContextValue } from './types';

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

ThemeContext.displayName = 'ThemeContext';
```

**`ThemeProvider.tsx`**
```typescript
import React, { useState, useMemo, useCallback } from 'react';
import { ThemeContext } from './context';
import { ThemeProviderProps, ThemeState } from './types';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialValue,
}) => {
  const [state, setState] = useState<ThemeState>({
    value: initialValue || '',
    isLoading: false,
  });

  const updateValue = useCallback((newValue: string) => {
    setState((prev) => ({ ...prev, value: newValue }));
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      updateValue,
    }),
    [state, updateValue]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**`useTheme.ts`**
```typescript
import { useContext } from 'react';
import { ThemeContext } from './context';
import { ThemeContextValue } from './types';

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
```

**`types.ts`**
```typescript
import { ReactNode } from 'react';

export interface ThemeState {
  value: string;
  isLoading: boolean;
}

export interface ThemeContextValue extends ThemeState {
  updateValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  initialValue?: string;
}
```

### After Generation

1. Add to `src/providers/index.ts`:
```typescript
export * from './Theme';
```

2. Wrap your app in `app/_layout.tsx`:
```typescript
import { ThemeProvider } from '@/providers';

export default function RootLayout() {
  return (
    <ThemeProvider initialValue="light">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

3. Use in components:
```typescript
import { useTheme } from '@/providers';

function MyComponent() {
  const { value, updateValue } = useTheme();

  return (
    <Button onPress={() => updateValue('dark')}>
      Current theme: {value}
    </Button>
  );
}
```

---

## Best Practices

### Component Generator

1. **Start simple** - Use generated template as base, extend as needed
2. **Add proper props** - Update `types.ts` with your component's props
3. **Use testID** - Always include testID for E2E testing
4. **Extract styles** - Keep StyleSheet at bottom of file
5. **Export through barrel** - Always export from `src/components/index.ts`

Example props extension:
```typescript
export interface UserCardProps extends ViewProps {
  user: User;
  onPress?: () => void;
  showAvatar?: boolean;
  testID?: string;
}
```

### Hook Generator

1. **Clear return type** - Define what the hook returns
2. **Options pattern** - Use options object for flexibility
3. **Cleanup effects** - Return cleanup functions in useEffect
4. **Memoize callbacks** - Use useCallback for functions
5. **Document behavior** - Add JSDoc comments

Example hook:
```typescript
export const useFetch = <T>(url: string, options?: UseFetchOptions): UseFetchReturn<T> => {
  // Implementation
};
```

### Provider Generator

1. **Separate concerns** - Context definition separate from provider
2. **Type safety** - Proper types for state and context value
3. **Memoization** - useMemo for context value to prevent re-renders
4. **Error boundaries** - Hook throws if used outside provider
5. **Composable** - Providers can wrap other providers

Example provider composition:
```typescript
<AuthProvider>
  <ThemeProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </ThemeProvider>
</AuthProvider>
```

---

## Advanced Usage

### Custom Component with Multiple Props

```bash
yarn generate:component ProductCard
```

Then update `types.ts`:
```typescript
export interface ProductCardProps extends ViewProps {
  product: Product;
  onPress: () => void;
  onFavorite?: () => void;
  showBadge?: boolean;
  variant?: 'default' | 'compact';
  testID?: string;
}
```

### Hook with Generic Types

```bash
yarn generate:hook useApi
```

Then update to support generics:
```typescript
export const useApi = <T>(endpoint: string): UseApiReturn<T> => {
  // Implementation
};
```

### Provider with Multiple Contexts

For complex state, create multiple providers and compose them:

```bash
yarn generate:provider Auth
yarn generate:provider User
yarn generate:provider Settings
```

Then compose in `app/_layout.tsx`:
```typescript
<AuthProvider>
  <UserProvider>
    <SettingsProvider>
      {children}
    </SettingsProvider>
  </UserProvider>
</AuthProvider>
```

---

## Troubleshooting

### Generator Fails

**Error: "Component already exists"**
- Check if folder exists in `src/components/`
- Delete or rename existing component

**Error: "Must be in PascalCase"**
- Component/Provider names: `UserCard`, `ProductList`
- Hook names: `useAuth`, `useFetch`

### Import Errors

If imports don't work:
1. Check `tsconfig.json` has path aliases
2. Check `babel.config.js` has module resolver
3. Restart Metro bundler: `yarn start --clear`

### Test Errors

If tests fail:
1. Install test dependencies: `yarn install`
2. Update `jest.setup.js` with necessary mocks
3. Run tests: `yarn test`

---

## Examples

### Full Component Example

```bash
# Generate component
yarn generate:component OrderCard

# Update types.ts
export interface OrderCardProps extends ViewProps {
  order: Order;
  onPress: () => void;
  testID?: string;
}

# Update OrderCard.tsx
export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  style,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      testID={testID}
    >
      <Text>{order.id}</Text>
      <Text>{order.status}</Text>
    </TouchableOpacity>
  );
};

# Export in src/components/index.ts
export * from './OrderCard';
```

### Full Hook Example

```bash
# Generate hook
yarn generate:hook useOrders

# Update to fetch orders
export const useOrders = (filters?: OrderFilters): UseOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders(filters).then(setOrders);
  }, [filters]);

  return { orders, loading };
};
```

### Full Provider Example

```bash
# Generate provider
yarn generate:provider Cart

# Update to manage shopping cart
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};
```

---

## Summary

| Generator | Command | Output Folder | Files Created |
|-----------|---------|---------------|---------------|
| Component | `yarn generate:component Name` | `src/components/Name/` | 4 files |
| Hook | `yarn generate:hook useName` | `src/hooks/useName/` | 4 files |
| Provider | `yarn generate:provider Name` | `src/providers/Name/` | 6 files |

All generators create:
- Implementation file
- Types file
- Index file (barrel export)
- Test file
- (Provider also creates context and custom hook)

Happy coding! 🚀
