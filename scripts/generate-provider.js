#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get provider name from command line arguments
const providerName = process.argv[2];

if (!providerName) {
  console.error('❌ Error: Please provide a provider name');
  console.log('Usage: yarn generate:provider Theme');
  process.exit(1);
}

// Validate provider name (PascalCase)
if (!/^[A-Z][a-zA-Z0-9]*$/.test(providerName)) {
  console.error('❌ Error: Provider name must be in PascalCase (e.g., Theme)');
  process.exit(1);
}

// Create provider directory
const providerDir = path.join(process.cwd(), 'src', 'providers', providerName);

if (fs.existsSync(providerDir)) {
  console.error(`❌ Error: Provider "${providerName}" already exists`);
  process.exit(1);
}

fs.mkdirSync(providerDir, { recursive: true });

// Context file template
const contextTemplate = `import { createContext } from 'react';
import { ${providerName}ContextValue } from './types';

/**
 * ${providerName} Context
 */
export const ${providerName}Context = createContext<${providerName}ContextValue | undefined>(
  undefined
);

${providerName}Context.displayName = '${providerName}Context';
`;

// Provider file template
const providerTemplate = `import React, { useState, useMemo, useCallback } from 'react';
import { ${providerName}Context } from './context';
import { ${providerName}ProviderProps, ${providerName}State } from './types';

/**
 * ${providerName} Provider component
 */
export const ${providerName}Provider: React.FC<${providerName}ProviderProps> = ({
  children,
  initialValue,
}) => {
  const [state, setState] = useState<${providerName}State>({
    value: initialValue || '',
    isLoading: false,
  });

  const updateValue = useCallback((newValue: string) => {
    setState((prev) => ({ ...prev, value: newValue }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const reset = useCallback(() => {
    setState({
      value: initialValue || '',
      isLoading: false,
    });
  }, [initialValue]);

  const contextValue = useMemo(
    () => ({
      ...state,
      updateValue,
      setLoading,
      reset,
    }),
    [state, updateValue, setLoading, reset]
  );

  return (
    <${providerName}Context.Provider value={contextValue}>
      {children}
    </${providerName}Context.Provider>
  );
};
`;

// Hook file template
const hookTemplate = `import { useContext } from 'react';
import { ${providerName}Context } from './context';
import { ${providerName}ContextValue } from './types';

/**
 * Hook to use ${providerName} context
 */
export const use${providerName} = (): ${providerName}ContextValue => {
  const context = useContext(${providerName}Context);

  if (context === undefined) {
    throw new Error(
      'use${providerName} must be used within a ${providerName}Provider'
    );
  }

  return context;
};
`;

// Types file template
const typesTemplate = `import { ReactNode } from 'react';

export interface ${providerName}State {
  /**
   * Current value
   */
  value: string;

  /**
   * Loading state
   */
  isLoading: boolean;
}

export interface ${providerName}ContextValue extends ${providerName}State {
  /**
   * Update the value
   */
  updateValue: (value: string) => void;

  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => void;

  /**
   * Reset to initial state
   */
  reset: () => void;
}

export interface ${providerName}ProviderProps {
  /**
   * Child components
   */
  children: ReactNode;

  /**
   * Initial value
   */
  initialValue?: string;
}
`;

// Index file template
const indexTemplate = `export * from './context';
export * from './${providerName}Provider';
export * from './use${providerName}';
export * from './types';
`;

// Test file template
const testTemplate = `import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ${providerName}Provider } from './${providerName}Provider';
import { use${providerName} } from './use${providerName}';

describe('${providerName}Provider', () => {
  it('should provide context value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <${providerName}Provider>{children}</${providerName}Provider>
    );

    const { result } = renderHook(() => use${providerName}(), { wrapper });

    expect(result.current.value).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should update value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <${providerName}Provider>{children}</${providerName}Provider>
    );

    const { result } = renderHook(() => use${providerName}(), { wrapper });

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });

  it('should set loading state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <${providerName}Provider>{children}</${providerName}Provider>
    );

    const { result } = renderHook(() => use${providerName}(), { wrapper });

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should reset to initial state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <${providerName}Provider initialValue="initial">{children}</${providerName}Provider>
    );

    const { result } = renderHook(() => use${providerName}(), { wrapper });

    act(() => {
      result.current.updateValue('changed');
      result.current.reset();
    });

    expect(result.current.value).toBe('initial');
  });

  it('should throw error when used outside provider', () => {
    const { result } = renderHook(() => use${providerName}());

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('must be used within a ${providerName}Provider');
  });
});
`;

// Write files
fs.writeFileSync(path.join(providerDir, 'context.ts'), contextTemplate);
fs.writeFileSync(path.join(providerDir, `${providerName}Provider.tsx`), providerTemplate);
fs.writeFileSync(path.join(providerDir, `use${providerName}.ts`), hookTemplate);
fs.writeFileSync(path.join(providerDir, 'types.ts'), typesTemplate);
fs.writeFileSync(path.join(providerDir, 'index.ts'), indexTemplate);
fs.writeFileSync(path.join(providerDir, `${providerName}Provider.test.tsx`), testTemplate);

console.log(`✅ Provider "${providerName}" created successfully!`);
console.log(`\n📁 Files created:`);
console.log(`   - src/providers/${providerName}/context.ts`);
console.log(`   - src/providers/${providerName}/${providerName}Provider.tsx`);
console.log(`   - src/providers/${providerName}/use${providerName}.ts`);
console.log(`   - src/providers/${providerName}/types.ts`);
console.log(`   - src/providers/${providerName}/index.ts`);
console.log(`   - src/providers/${providerName}/${providerName}Provider.test.tsx`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Update context logic in context.ts`);
console.log(`   2. Add provider logic in ${providerName}Provider.tsx`);
console.log(`   3. Update types in types.ts`);
console.log(`   4. Wrap your app with the provider in app/_layout.tsx:`);
console.log(`      <${providerName}Provider>...</${providerName}Provider>`);
