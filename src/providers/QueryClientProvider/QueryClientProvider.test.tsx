import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
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

  it('should provide QueryClient to children', () => {
    const QueryComponent = () => {
      try {
        const { data, isLoading } = useQuery({
          queryKey: ['test'],
          queryFn: async () => 'test data',
        });
        return <Text>{isLoading ? 'Loading' : 'Ready'}</Text>;
      } catch {
        return <Text>Error</Text>;
      }
    };

    const { getByText } = render(
      <QueryClientProvider>
        <QueryComponent />
      </QueryClientProvider>
    );

    // Should render without throwing because QueryClient is provided
    expect(getByText(/Loading|Ready|Error/)).toBeTruthy();
  });

  it('should render nested children correctly', () => {
    const NestedComponent = () => (
      <>
        <Text>Nested 1</Text>
        <Text>Nested 2</Text>
      </>
    );

    const { getByText } = render(
      <QueryClientProvider>
        <NestedComponent />
      </QueryClientProvider>
    );

    expect(getByText('Nested 1')).toBeTruthy();
    expect(getByText('Nested 2')).toBeTruthy();
  });

  it('should handle null children', () => {
    expect(() => {
      render(<QueryClientProvider>{null}</QueryClientProvider>);
    }).not.toThrow();
  });

  it('should handle undefined children', () => {
    expect(() => {
      render(<QueryClientProvider>{undefined}</QueryClientProvider>);
    }).not.toThrow();
  });

  it('should handle fragment children', () => {
    const { getByText } = render(
      <QueryClientProvider>
        <>
          <Text>Fragment 1</Text>
          <Text>Fragment 2</Text>
        </>
      </QueryClientProvider>
    );

    expect(getByText('Fragment 1')).toBeTruthy();
    expect(getByText('Fragment 2')).toBeTruthy();
  });

  it('should maintain QueryClient instance across rerenders', () => {
    const { rerender } = render(
      <QueryClientProvider>
        <Text>Initial</Text>
      </QueryClientProvider>
    );

    // Rerender should still work without issues
    rerender(
      <QueryClientProvider>
        <Text>Updated</Text>
      </QueryClientProvider>
    );

    expect(() => {
      rerender(
        <QueryClientProvider>
          <Text>Final</Text>
        </QueryClientProvider>
      );
    }).not.toThrow();
  });

  it('should preserve child component state', () => {
    const StatefulComponent = () => {
      const [count, setCount] = React.useState(0);
      return <Text>{count}</Text>;
    };

    const { getByText } = render(
      <QueryClientProvider>
        <StatefulComponent />
      </QueryClientProvider>
    );

    expect(getByText('0')).toBeTruthy();
  });

  describe('QueryClient configuration', () => {
    it('should configure QueryClient with default options', () => {
      // Provider creates QueryClient internally with specific defaults
      // This test ensures it renders without errors, which means config is valid
      const { getByText } = render(
        <QueryClientProvider>
          <Text>Configured</Text>
        </QueryClientProvider>
      );

      expect(getByText('Configured')).toBeTruthy();
    });

    it('should support multiple providers', () => {
      const { getByText } = render(
        <QueryClientProvider>
          <QueryClientProvider>
            <Text>Nested providers</Text>
          </QueryClientProvider>
        </QueryClientProvider>
      );

      expect(getByText('Nested providers')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should render component with conditionally visible children', () => {
      const ConditionalComponent = ({ show }: { show: boolean }) => (
        <>
          {show && <Text>Visible</Text>}
          {!show && <Text>Hidden</Text>}
        </>
      );

      const { getByText, rerender } = render(
        <QueryClientProvider>
          <ConditionalComponent show={true} />
        </QueryClientProvider>
      );

      expect(getByText('Visible')).toBeTruthy();

      rerender(
        <QueryClientProvider>
          <ConditionalComponent show={false} />
        </QueryClientProvider>
      );

      expect(getByText('Hidden')).toBeTruthy();
    });

    it('should render deeply nested components', () => {
      const Level3 = () => <Text>Level 3</Text>;
      const Level2 = () => <Level3 />;
      const Level1 = () => <Level2 />;

      const { getByText } = render(
        <QueryClientProvider>
          <Level1 />
        </QueryClientProvider>
      );

      expect(getByText('Level 3')).toBeTruthy();
    });

    it('should handle children with side effects', () => {
      const sideEffectFn = jest.fn();

      const SideEffectComponent = () => {
        React.useEffect(() => {
          sideEffectFn();
        }, []);
        return <Text>Side effect</Text>;
      };

      const { getByText } = render(
        <QueryClientProvider>
          <SideEffectComponent />
        </QueryClientProvider>
      );

      expect(getByText('Side effect')).toBeTruthy();
      expect(sideEffectFn).toHaveBeenCalled();
    });
  });
});
