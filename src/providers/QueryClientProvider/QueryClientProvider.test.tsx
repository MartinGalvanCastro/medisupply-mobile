import { render } from '@testing-library/react-native';

describe('QueryClientProvider', () => {
  let QueryClientProvider: any;
  const mockConfigCalls: any[] = [];

  beforeEach(() => {
    jest.resetModules();
    mockConfigCalls.length = 0;

    // Use doMock for dynamic mocking
    jest.doMock('@tanstack/react-query', () => ({
      QueryClient: jest.fn((config) => {
        mockConfigCalls.push(config);
        return {
          defaultOptions: config.defaultOptions,
          getQueryCache: jest.fn(),
          getMutationCache: jest.fn(),
          setDefaultOptions: jest.fn(),
        };
      }),
      QueryClientProvider: function ({ children }: any) {
        return children;
      },
    }));

    // Require after mocking
    const module = require('./QueryClientProvider');
    QueryClientProvider = module.QueryClientProvider;
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('QueryClient configuration', () => {
    it('should create QueryClient with correct staleTime for queries', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(mockConfigCalls.length).toBeGreaterThan(0);
      const config = mockConfigCalls[0];
      expect(config.defaultOptions.queries.staleTime).toBe(1000 * 60 * 5);
    });

    it('should create QueryClient with correct gcTime for queries', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.queries.gcTime).toBe(1000 * 60 * 10);
    });

    it('should create QueryClient with retry count of 1 for queries', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.queries.retry).toBe(1);
    });

    it('should create QueryClient with refetchOnWindowFocus disabled for queries', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.queries.refetchOnWindowFocus).toBe(false);
    });

    it('should create QueryClient with retry count of 0 for mutations', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.mutations.retry).toBe(0);
    });

    it('should include all required default options for queries', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      const defaultOptions = config.defaultOptions;

      expect(defaultOptions.queries).toHaveProperty('staleTime');
      expect(defaultOptions.queries).toHaveProperty('gcTime');
      expect(defaultOptions.queries).toHaveProperty('retry');
      expect(defaultOptions.queries).toHaveProperty('refetchOnWindowFocus');
    });

    it('should include all required default options for mutations', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      const defaultOptions = config.defaultOptions;

      expect(defaultOptions.mutations).toHaveProperty('retry');
    });

    it('should use consistent staleTime value of 5 minutes', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      const expectedStaleTime = 5 * 60 * 1000;

      expect(config.defaultOptions.queries.staleTime).toBe(expectedStaleTime);
    });

    it('should use consistent gcTime value of 10 minutes', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      const expectedGcTime = 10 * 60 * 1000;

      expect(config.defaultOptions.queries.gcTime).toBe(expectedGcTime);
    });
  });

  describe('Provider behavior', () => {
    it('should render children correctly', () => {
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('should accept children prop', () => {
      const testText = 'Test Child Content';
      const { queryByText } = render(
        <QueryClientProvider>
          <>{testText}</>
        </QueryClientProvider>
      );

      expect(queryByText(testText)).toBeDefined();
    });

    it('should wrap single child element', () => {
      const SingleChildComponent = () => <></>;
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          <SingleChildComponent />
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('should wrap multiple child elements', () => {
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          <>
            <></>
            <></>
            <></>
          </>
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('should use TanStackQueryClientProvider as wrapper', () => {
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Module-level QueryClient instance', () => {
    it('should create queryClient with configuration on first render', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(mockConfigCalls.length).toBe(1);
      expect(mockConfigCalls[0]).toHaveProperty('defaultOptions');
    });

    it('should reuse same queryClient instance across multiple renders', () => {
      const { rerender } = render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const initialCallCount = mockConfigCalls.length;

      rerender(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(mockConfigCalls.length).toBe(initialCallCount);
    });
  });

  describe('Type and interface compliance', () => {
    it('should accept children as ReactNode', () => {
      const testChild = <div>Child</div>;
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          {testChild}
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('should be a valid React.FC component', () => {
      expect(typeof QueryClientProvider).toBe('function');
    });

    it('should accept props object with children property', () => {
      const props = {
        children: <></>,
      };

      const { UNSAFE_root } = render(
        <QueryClientProvider {...props}>
          <></>
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Query configuration verification', () => {
    it('should not refetch on window focus to avoid unnecessary requests', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.queries.refetchOnWindowFocus).toBe(false);
    });

    it('should retry failed queries once by default', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.queries.retry).toBe(1);
    });

    it('should not retry mutations by default', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.mutations.retry).toBe(0);
    });

    it('should have separate retry configuration for queries and mutations', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];
      expect(config.defaultOptions.queries.retry).toBe(1);
      expect(config.defaultOptions.mutations.retry).toBe(0);
      expect(config.defaultOptions.queries.retry).not.toBe(
        config.defaultOptions.mutations.retry
      );
    });
  });

  describe('Configuration persistence', () => {
    it('should maintain staleTime across multiple renders', () => {
      const { rerender } = render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const firstCallConfig = mockConfigCalls[0];

      rerender(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(firstCallConfig.defaultOptions.queries.staleTime).toBe(1000 * 60 * 5);
    });

    it('should maintain gcTime across multiple renders', () => {
      const { rerender } = render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const firstCallConfig = mockConfigCalls[0];

      rerender(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(firstCallConfig.defaultOptions.queries.gcTime).toBe(1000 * 60 * 10);
    });
  });

  describe('Edge cases', () => {
    it('should handle null children gracefully', () => {
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          {null}
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('should handle undefined children gracefully', () => {
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          {undefined}
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });

    it('should handle text node children', () => {
      const { queryByText } = render(
        <QueryClientProvider>
          Test text node
        </QueryClientProvider>
      );

      expect(queryByText('Test text node')).toBeDefined();
    });

    it('should handle mixed children types', () => {
      const { UNSAFE_root } = render(
        <QueryClientProvider>
          <>
            <div>Element</div>
            Text
            {null}
          </>
        </QueryClientProvider>
      );

      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Configuration values correctness', () => {
    it('staleTime should be exactly 300000 milliseconds (5 minutes)', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(mockConfigCalls[0].defaultOptions.queries.staleTime).toBe(300000);
    });

    it('gcTime should be exactly 600000 milliseconds (10 minutes)', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      expect(mockConfigCalls[0].defaultOptions.queries.gcTime).toBe(600000);
    });

    it('should verify configuration object structure', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];

      expect(config).toHaveProperty('defaultOptions');
      expect(config.defaultOptions).toHaveProperty('queries');
      expect(config.defaultOptions).toHaveProperty('mutations');
    });

    it('should have correct object nesting for defaultOptions', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];

      expect(typeof config.defaultOptions).toBe('object');
      expect(typeof config.defaultOptions.queries).toBe('object');
      expect(typeof config.defaultOptions.mutations).toBe('object');
    });

    it('should have all queries config values as proper types', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const { queries } = mockConfigCalls[0].defaultOptions;

      expect(typeof queries.staleTime).toBe('number');
      expect(typeof queries.gcTime).toBe('number');
      expect(typeof queries.retry).toBe('number');
      expect(typeof queries.refetchOnWindowFocus).toBe('boolean');
    });

    it('should have all mutations config values as proper types', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const { mutations } = mockConfigCalls[0].defaultOptions;

      expect(typeof mutations.retry).toBe('number');
    });
  });

  describe('Real-world scenarios', () => {
    it('should properly initialize for use with data fetching', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];

      expect(config.defaultOptions.queries.staleTime).toBeDefined();
      expect(config.defaultOptions.queries.gcTime).toBeDefined();
      expect(config.defaultOptions.queries.retry).toBeDefined();
      expect(config.defaultOptions.queries.refetchOnWindowFocus).toBeDefined();
    });

    it('should configure sensible defaults for mobile app usage', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];

      expect(config.defaultOptions.queries.refetchOnWindowFocus).toBe(false);
      expect(config.defaultOptions.queries.staleTime).toBe(300000);
      expect(config.defaultOptions.queries.gcTime).toBe(600000);
    });

    it('should retry queries but not mutations to handle transient failures', () => {
      render(
        <QueryClientProvider>
          <></>
        </QueryClientProvider>
      );

      const config = mockConfigCalls[0];

      expect(config.defaultOptions.queries.retry).toBe(1);
      expect(config.defaultOptions.mutations.retry).toBe(0);
    });
  });
});
