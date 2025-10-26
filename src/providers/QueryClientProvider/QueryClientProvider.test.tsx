import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QueryClientProvider } from './QueryClientProvider';

describe('QueryClientProvider', () => {

  it('should render children correctly', () => {
    const { getByText } = render(
      <QueryClientProvider>
        <Text>Test Child</Text>
      </QueryClientProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should wrap children with TanStack QueryClientProvider', () => {
    const TestComponent = () => <Text>Test Component</Text>;

    const { getByText } = render(
      <QueryClientProvider>
        <TestComponent />
      </QueryClientProvider>
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <QueryClientProvider>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </QueryClientProvider>
    );

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });
});
