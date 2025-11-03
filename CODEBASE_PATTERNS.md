# Codebase Patterns & Conventions

> **Purpose:** This document captures existing patterns in the medisupply-mobile codebase to ensure consistency when adding new features.

---

## 📁 File Structure & Organization

### Screens
```
src/screens/
├── ScreenName/
│   ├── ScreenNameScreen.tsx       # Main screen component
│   ├── ScreenNameScreen.test.tsx  # Test file (same folder)
│   └── index.ts                   # Barrel export
```

**Example:**
```
src/screens/SignUp/
├── SignUpScreen.tsx
├── SignUpScreen.test.tsx
└── index.ts
```

**Note:** Screen-specific components go in `src/components/`, NOT inside screen folders.

### Components
```
src/components/
├── ComponentName/
│   ├── ComponentName.tsx          # Component implementation
│   ├── ComponentName.test.tsx     # Test file (same folder)
│   └── index.ts                   # Barrel export
```

**Example:**
```
src/components/FormInput/
├── FormInput.tsx
├── FormInput.test.tsx
└── index.ts
```

**Important:** ALL components live in `src/components/`, even if they're only used by one screen. No nested component folders inside screens.

### Stores (Zustand)
```
src/store/
├── useStoreName/
│   ├── useStoreName.ts            # Store implementation
│   ├── types.ts                   # Type definitions
│   └── index.ts                   # Barrel export (store + types)
```

**Example:**
```
src/store/useAuthStore/
├── useAuthStore.ts
├── types.ts
└── index.ts  // Exports: useAuthStore, AuthStore, AuthState, etc.
```

### Providers
```
src/providers/
├── ProviderName/
│   ├── ProviderName.tsx           # Provider implementation
│   ├── ProviderName.test.tsx      # Test file
│   ├── types.ts                   # Type definitions
│   └── index.ts                   # Barrel export
```

---

## 📦 Barrel Export Pattern

**ALWAYS use barrel exports** via `index.ts` files:

### Simple Export (Components/Screens)
```typescript
// src/components/FormInput/index.ts
export { FormInput } from './FormInput';
```

### Export with Types (Stores/Providers)
```typescript
// src/store/useAuthStore/index.ts
export { useAuthStore } from './useAuthStore';
export type { AuthStore, AuthState, AuthActions, User } from './types';
```

### Import Pattern
```typescript
// ✅ GOOD - Import from barrel
import { FormInput } from '@/components/FormInput';
import { useAuthStore } from '@/store/useAuthStore';

// ❌ BAD - Don't import directly from file
import { FormInput } from '@/components/FormInput/FormInput';
```

---

## 🧪 Test File Location

**Tests are co-located with the component/screen they test:**

```
✅ CORRECT Structure:
src/components/FormInput/
├── FormInput.tsx
├── FormInput.test.tsx  ← Same folder
└── index.ts

src/screens/SignUp/
├── SignUpScreen.tsx
├── SignUpScreen.test.tsx  ← Same folder
└── index.ts
```

**Naming Convention:**
- File: `ComponentName.tsx`
- Test: `ComponentName.test.tsx` (NOT `.spec.tsx`)

---

## 📱 Screen Component Patterns

### Structure
```typescript
// 1. Imports (grouped)
import { gluestack-ui components } from '@/components/ui/...';
import { custom components } from '@/components/...';
import { hooks } from '@/hooks/...';
import { providers/stores } from '@/providers/...';
import { types } from '@/types/...';
import { external libs } from 'external-package';
import { react-native } from 'react-native';

// 2. Types (inline, above component)
type ScreenFormData = {
  field1: string;
  field2: string;
};

// 3. Schema factory (if using forms)
const createSchema = (t: (key: any) => string) =>
  z.object({
    field1: z.string().min(1, t('validation.required')),
  });

// 4. Component (named export)
export const ScreenNameScreen = () => {
  // Hooks first
  const { t } = useTranslation();
  const store = useStore();

  // State
  const [state, setState] = useState();

  // Form (if applicable)
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(createSchema(t)),
  });

  // Handlers
  const onSubmit = async (data) => {
    // ...
  };

  // Render
  return (
    <SafeAreaView testID="screen-name-screen" style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {/* Content */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 5. Styles (StyleSheet at bottom)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Key Patterns:
- **Named export** (not default): `export const ScreenNameScreen`
- **TestID on root**: `testID="screen-name-screen"`
- **SafeAreaView + KeyboardAvoidingView** for most screens
- **useTranslation** hook for all text
- **Schema factory** for form validation (receives `t` function)
- **StyleSheet** for styles (no inline objects for complex styles)

---

## 🧩 Component Patterns

### Reusable Component Structure
```typescript
// 1. Imports
import { Component } from '@/components/ui/component';
import type { PropsType } from 'react-native';

// 2. Interface (props definition)
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  testID?: string;
  onPress?: () => void;
}

// 3. Component (named export)
export const ComponentName = ({
  prop1,
  prop2,
  testID,
  onPress,
}: ComponentNameProps) => {
  return (
    <Component testID={testID}>
      {/* Content */}
    </Component>
  );
};
```

### Form Components (FormInput, FormDropdown)
```typescript
// Always use Controller from react-hook-form
interface FormInputProps {
  control: Control<any>;
  name: string;
  placeholder: string;
  error?: FieldError;
  testID?: string;
  // ... other props
}

export const FormInput = ({ control, name, error, testID }: FormInputProps) => {
  return (
    <FormControl isInvalid={!!error} className="mb-4">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input>
            <InputField
              testID={testID}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          </Input>
        )}
      />
      {error && (
        <FormControlError>
          <FormControlErrorText testID={`${testID}-error`}>
            {error.message}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
```

**Key Patterns:**
- **Interface** for props (not type)
- **Named export**
- **testID** prop for testing
- **className** for styling (NativeWind/TailwindCSS)
- **Error handling** with testID for error text

---

## 🗄️ Store Patterns (Zustand + MMKV)

### Store Structure
```typescript
// useStoreName.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';
import type { StoreType, StateType } from './types';

const initialState: StateType = {
  field1: null,
  field2: false,
};

export const useStoreName = create<StoreType>()(
  persist(
    (set) => ({
      ...initialState,

      // Actions
      setField1: (field1) => set({ field1 }),

      reset: () => set(initialState),

      updateField: (updates) =>
        set((state) => ({
          field1: state.field1 ? { ...state.field1, ...updates } : null,
        })),
    }),
    {
      name: 'store-name-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
```

### Types File
```typescript
// types.ts
export interface StateType {
  field1: SomeType | null;
  field2: boolean;
}

export interface Actions {
  setField1: (field1: SomeType) => void;
  reset: () => void;
  updateField: (updates: Partial<SomeType>) => void;
}

export type StoreType = StateType & Actions;
```

**Key Patterns:**
- **persist middleware** for storage
- **MMKV** via `zustandStorage` (from `@/utils/storage`)
- **initialState** constant
- **reset** action returns to initialState
- **Type separation**: State + Actions = Store

---

## 🎯 Provider Patterns

### Provider Structure
```typescript
// ProviderName.tsx
import { createContext, useContext, useCallback } from 'react';
import type { ProviderContextValue, ProviderProps } from './types';

const ProviderContext = createContext<ProviderContextValue | undefined>(undefined);

export const ProviderName = ({ children }: ProviderProps) => {
  // Hooks
  const { mutateAsync, isPending } = useMutation();

  // Actions
  const doSomething = useCallback(async (param: string) => {
    await mutateAsync({ param });
  }, [mutateAsync]);

  // Context value
  const value: ProviderContextValue = {
    doSomething,
    isPending,
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};

// Hook
export const useProviderName = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProviderName must be used within ProviderName');
  }
  return context;
};
```

**Key Patterns:**
- **createContext** with typed value
- **Custom hook** for consuming context
- **Error handling** in custom hook
- **useCallback** for stable functions
- **Types** in separate `types.ts` file

---

## 🌍 i18n Patterns

### Translation Structure
```typescript
// src/i18n/locales/en.ts
export const en = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
  },
  validation: {
    required: 'This field is required',
    passwordMin: 'Password must be at least {{min}} characters',
  },
  screens: {
    screenName: {
      title: 'Screen Title',
      subtitle: 'Screen Subtitle',
      field1: 'Field 1 Label',
      button: 'Button Text',
    },
  },
};
```

### Usage
```typescript
import { useTranslation } from '@/i18n/hooks';

export const Component = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading>{t('screens.screenName.title')}</Heading>
      <Text>{t('validation.passwordMin').replace('{{min}}', '8')}</Text>
    </>
  );
};
```

**Key Patterns:**
- **Nested structure**: `category.subcategory.key`
- **Interpolation**: Use `{{variable}}` syntax
- **Replace in code**: `.replace('{{min}}', '8')`
- **Mirror structure** in `es.ts` (Spanish translations)

---

## 🌐 API Patterns

### Generated API
```typescript
// Generated hooks from OpenAPI
import {
  useGetSomethingBffAppGet,
  useCreateSomethingBffAppPost,
} from '@/api/generated/path/path';

// Usage in component
const { data, isLoading, error } = useGetSomethingBffAppGet({
  query: {
    enabled: true,
    staleTime: 5 * 60 * 1000,
  },
});

const { mutateAsync, isPending } = useCreateSomethingBffAppPost();
```

### Mock API (for missing endpoints)
```typescript
// src/api/mocks/clients.ts
export const mockClients = [
  { id: '1', name: 'Client 1' },
  { id: '2', name: 'Client 2' },
];

// src/api/hooks/useClients.ts
import { useQuery } from '@tanstack/react-query';
import { mockClients } from '@/api/mocks/clients';

export function useClients(filters?: { search?: string }) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800)); // Mock delay

      let results = mockClients;

      if (filters?.search) {
        results = results.filter(c =>
          c.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      return results;
    },
  });
}
```

**Key Patterns:**
- **React Query** hooks (useQuery, useMutation)
- **Naming**: `use{Action}{Path}` (e.g., `useGetClientsGet`)
- **Mock delay**: 800ms for realistic simulation
- **queryKey**: Array with feature + filters

---

## 🎨 Styling Patterns

### Priority Order
1. **NativeWind/TailwindCSS** (className) - preferred for simple styles
2. **gluestack-ui props** (variant, size) - for component variants
3. **StyleSheet** - for complex/reusable styles

### Examples
```typescript
// 1. NativeWind (preferred)
<View className="flex-1 px-4 py-2 bg-white rounded-lg">

// 2. gluestack-ui props
<Button variant="solid" size="md">

// 3. StyleSheet (complex styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

<View style={styles.container}>
```

**Key Patterns:**
- **className** for margins, padding, flex, colors
- **StyleSheet** for shadows, complex layouts
- **No inline styles** (except dynamic values)

---

## 🧪 Testing Patterns

### Component Test Structure
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { ComponentName } from './ComponentName';
import { useForm } from 'react-hook-form';

// Test Wrapper (for components needing context)
const TestWrapper = ({ prop1, prop2 }: any) => {
  const { control } = useForm({
    defaultValues: { field: '' },
  });

  return (
    <ComponentName control={control} prop1={prop1} prop2={prop2} />
  );
};

describe('ComponentName', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(<ComponentName testID="test" />);
    expect(getByTestId('test')).toBeTruthy();
  });

  it('should handle user interaction', () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(
      <ComponentName testID="test" onPress={mockFn} />
    );

    fireEvent.press(getByTestId('test'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Screen Test Structure
```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ScreenName } from './ScreenName';

// Mock dependencies
jest.mock('@/providers/SomeProvider');
jest.mock('@/i18n/hooks');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

describe('ScreenName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render screen correctly', () => {
    const { getByTestId } = render(<ScreenName />);
    expect(getByTestId('screen-name-screen')).toBeTruthy();
  });
});
```

**Key Patterns:**
- **Describe blocks** for grouping
- **TestWrapper** for components needing hooks/context
- **Mock external dependencies** (providers, router, i18n)
- **beforeEach** for cleanup
- **waitFor** for async operations

---

## 📥 Import Patterns

### Import Order (top to bottom)
```typescript
// 1. gluestack-ui components
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';

// 2. Custom components
import { FormInput } from '@/components/FormInput';

// 3. Hooks
import { useTranslation } from '@/i18n/hooks';

// 4. Providers/Stores
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';

// 5. Types/Enums
import type { User } from '@/types';
import { InstitutionType } from '@/types/enums';

// 6. Utils
import { formatDate } from '@/utils';

// 7. External libraries
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';

// 8. React Native
import { View, StyleSheet } from 'react-native';
```

### Path Aliases
```typescript
// ✅ Use @ alias
import { Component } from '@/components/Component';
import { useStore } from '@/store/useStore';

// ❌ Don't use relative paths for src/
import { Component } from '../../../components/Component';
```

---

## 📛 Naming Conventions

### Files
- **Screens**: `ScreenNameScreen.tsx` (PascalCase + "Screen" suffix)
- **Components**: `ComponentName.tsx` (PascalCase)
- **Hooks**: `useSomething.ts` (camelCase + "use" prefix)
- **Types**: `types.ts` (lowercase)
- **Utils**: `something.utils.ts` (lowercase + ".utils" suffix)
- **Tests**: `ComponentName.test.tsx` (matches file name + ".test")

### Variables/Functions
- **Components**: `ComponentName` (PascalCase)
- **Hooks**: `useSomething` (camelCase + "use" prefix)
- **Functions**: `doSomething` (camelCase)
- **Constants**: `CONSTANT_NAME` (UPPER_SNAKE_CASE) or `constantName` (camelCase)
- **Types/Interfaces**: `TypeName` (PascalCase)

### TestIDs
- **Screens**: `screen-name-screen` (kebab-case + "-screen" suffix)
- **Components**: `component-name` (kebab-case)
- **Form inputs**: `field-name-input` (kebab-case + "-input" suffix)
- **Buttons**: `action-button` (kebab-case + "-button" suffix)
- **Error messages**: `field-name-input-error` (base-testID + "-error")

---

## 📝 Summary Checklist

When creating new features, ensure:

- [ ] Files follow folder structure pattern (ScreenName/ScreenName.tsx)
- [ ] All components go in `src/components/` (not in screen folders)
- [ ] Barrel exports (`index.ts`) are created
- [ ] Tests are co-located (same folder as component)
- [ ] Named exports are used (not default)
- [ ] testID props are included on interactive elements
- [ ] i18n is used for all user-facing text (no hardcoded strings)
- [ ] Types are defined (interfaces for props, types for state)
- [ ] Imports follow the order pattern
- [ ] Path aliases (@/) are used
- [ ] Naming conventions are followed
- [ ] StyleSheet used for complex styles, className for simple
- [ ] Forms use react-hook-form + zod validation
- [ ] Stores use Zustand + MMKV persistence
- [ ] API calls use React Query hooks

---

**Last Updated:** 2025-11-02
**Analyzed Codebase Version:** medisupply-mobile (commit: 6e76ab3)
