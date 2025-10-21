#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get hook name from command line arguments
const hookName = process.argv[2];

if (!hookName) {
  console.error('❌ Error: Please provide a hook name');
  console.log('Usage: yarn generate:hook useMyHook');
  process.exit(1);
}

// Validate hook name (must start with 'use' and be camelCase)
if (!/^use[A-Z][a-zA-Z0-9]*$/.test(hookName)) {
  console.error('❌ Error: Hook name must start with "use" and be in camelCase (e.g., useMyHook)');
  process.exit(1);
}

// Create hook directory
const hookDir = path.join(process.cwd(), 'src', 'hooks', hookName);

if (fs.existsSync(hookDir)) {
  console.error(`❌ Error: Hook "${hookName}" already exists`);
  process.exit(1);
}

fs.mkdirSync(hookDir, { recursive: true });

// Hook file template
const hookTemplate = `import { useState, useEffect } from 'react';
import { ${hookName}Options, ${hookName}Return } from './types';

/**
 * Custom hook: ${hookName}
 *
 * @param options - Hook options
 * @returns Hook return value
 */
export const ${hookName} = (options?: ${hookName}Options): ${hookName}Return => {
  const [value, setValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add your hook logic here
    console.log('${hookName} initialized', options);
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
`;

// Types file template
const typesTemplate = `export interface ${hookName}Options {
  /**
   * Hook option example
   */
  initialValue?: string;
}

export interface ${hookName}Return {
  /**
   * Current value
   */
  value: string;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error state
   */
  error: Error | null;

  /**
   * Reset function
   */
  reset: () => void;
}
`;

// Index file template
const indexTemplate = `export * from './${hookName}';
export * from './types';
`;

// Test file template
const testTemplate = `import { renderHook, act } from '@testing-library/react-hooks';
import { ${hookName} } from './${hookName}';

describe('${hookName}', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => ${hookName}());

    expect(result.current.value).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should reset values', () => {
    const { result } = renderHook(() => ${hookName}());

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('');
    expect(result.current.error).toBe(null);
  });

  it('should accept initial options', () => {
    const options = { initialValue: 'test' };
    const { result } = renderHook(() => ${hookName}(options));

    // Add your custom assertions here
    expect(result.current).toBeDefined();
  });
});
`;

// Write files
fs.writeFileSync(path.join(hookDir, `${hookName}.ts`), hookTemplate);
fs.writeFileSync(path.join(hookDir, 'types.ts'), typesTemplate);
fs.writeFileSync(path.join(hookDir, 'index.ts'), indexTemplate);
fs.writeFileSync(path.join(hookDir, `${hookName}.test.ts`), testTemplate);

console.log(`✅ Hook "${hookName}" created successfully!`);
console.log(`\n📁 Files created:`);
console.log(`   - src/hooks/${hookName}/${hookName}.ts`);
console.log(`   - src/hooks/${hookName}/types.ts`);
console.log(`   - src/hooks/${hookName}/index.ts`);
console.log(`   - src/hooks/${hookName}/${hookName}.test.ts`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Add your hook logic in ${hookName}.ts`);
console.log(`   2. Update types in types.ts`);
console.log(`   3. Export from src/hooks/index.ts:`);
console.log(`      export * from './${hookName}';`);
