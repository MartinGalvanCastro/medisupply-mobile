#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get component name from command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error('❌ Error: Please provide a component name');
  console.log('Usage: yarn generate:component ComponentName');
  process.exit(1);
}

// Validate component name (PascalCase)
if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error('❌ Error: Component name must be in PascalCase (e.g., MyComponent)');
  process.exit(1);
}

// Create component directory
const componentDir = path.join(process.cwd(), 'src', 'components', componentName);

if (fs.existsSync(componentDir)) {
  console.error(`❌ Error: Component "${componentName}" already exists`);
  process.exit(1);
}

fs.mkdirSync(componentDir, { recursive: true });

// Component file template
const componentTemplate = `import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ${componentName}Props } from './types';

/**
 * ${componentName} component
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
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
`;

// Types file template
const typesTemplate = `import { ViewProps } from 'react-native';

export interface ${componentName}Props extends ViewProps {
  /**
   * Child elements to render
   */
  children?: React.ReactNode;

  /**
   * Test ID for testing
   */
  testID?: string;
}
`;

// Index file template
const indexTemplate = `export * from './${componentName}';
export * from './types';
`;

// Test file template
const testTemplate = `import React from 'react';
import { render } from '@testing-library/react-native';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(
      <${componentName} testID="${componentName.toLowerCase()}">
        Test Content
      </${componentName}>
    );

    expect(getByTestId('${componentName.toLowerCase()}')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <${componentName} testID="${componentName.toLowerCase()}" style={customStyle}>
        Test Content
      </${componentName}>
    );

    const component = getByTestId('${componentName.toLowerCase()}');
    expect(component.props.style).toContainEqual(customStyle);
  });
});
`;

// Write files
fs.writeFileSync(path.join(componentDir, `${componentName}.tsx`), componentTemplate);
fs.writeFileSync(path.join(componentDir, 'types.ts'), typesTemplate);
fs.writeFileSync(path.join(componentDir, 'index.ts'), indexTemplate);
fs.writeFileSync(path.join(componentDir, `${componentName}.test.tsx`), testTemplate);

console.log(`✅ Component "${componentName}" created successfully!`);
console.log(`\n📁 Files created:`);
console.log(`   - src/components/${componentName}/${componentName}.tsx`);
console.log(`   - src/components/${componentName}/types.ts`);
console.log(`   - src/components/${componentName}/index.ts`);
console.log(`   - src/components/${componentName}/${componentName}.test.tsx`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Add your component logic in ${componentName}.tsx`);
console.log(`   2. Update types in types.ts`);
console.log(`   3. Export from src/components/index.ts:`);
console.log(`      export * from './${componentName}';`);
