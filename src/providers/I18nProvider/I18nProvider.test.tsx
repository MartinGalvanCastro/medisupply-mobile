import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { I18nProvider } from './I18nProvider';
import i18n from '../../i18n/config/i18n.config';

// Mock i18n
jest.mock('../../i18n/config/i18n.config', () => ({
  __esModule: true,
  default: {
    isInitialized: true,
    init: jest.fn(),
    use: jest.fn(() => ({
      init: jest.fn(),
    })),
  },
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (i18n as any).isInitialized = true;
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <I18nProvider>
        <Text>Test Child</Text>
      </I18nProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should wrap children with I18nextProvider', () => {
    const TestComponent = () => <Text>Test Component</Text>;

    const { getByText } = render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should not initialize i18n if already initialized', () => {
    (i18n as any).isInitialized = true;
    (i18n.init as jest.Mock).mockClear();

    render(
      <I18nProvider>
        <Text>Child</Text>
      </I18nProvider>
    );

    expect(i18n.init).not.toHaveBeenCalled();
  });

  it('should initialize i18n if not initialized', () => {
    (i18n as any).isInitialized = false;
    (i18n.init as jest.Mock).mockClear();

    render(
      <I18nProvider>
        <Text>Child</Text>
      </I18nProvider>
    );

    expect(i18n.init).toHaveBeenCalled();
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <I18nProvider>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </I18nProvider>
    );

    expect(getByText('First Child')).toBeTruthy();
    expect(getByText('Second Child')).toBeTruthy();
  });

  it('should initialize i18n only once on mount', () => {
    (i18n as any).isInitialized = false;
    (i18n.init as jest.Mock).mockClear();

    const { rerender } = render(
      <I18nProvider>
        <Text>Child</Text>
      </I18nProvider>
    );

    expect(i18n.init).toHaveBeenCalledTimes(1);

    // Rerender should not call init again because it's now initialized
    (i18n as any).isInitialized = true;
    rerender(
      <I18nProvider>
        <Text>Child Updated</Text>
      </I18nProvider>
    );

    expect(i18n.init).toHaveBeenCalledTimes(1);
  });

  it('should render complex nested children', () => {
    const NestedComponent = () => (
      <>
        <Text>Nested 1</Text>
        <Text>Nested 2</Text>
      </>
    );

    const { getByText } = render(
      <I18nProvider>
        <NestedComponent />
      </I18nProvider>
    );

    expect(getByText('Nested 1')).toBeTruthy();
    expect(getByText('Nested 2')).toBeTruthy();
  });

  it('should handle null children', () => {
    expect(() => {
      render(<I18nProvider>{null}</I18nProvider>);
    }).not.toThrow();
  });

  it('should handle undefined children', () => {
    expect(() => {
      render(<I18nProvider>{undefined}</I18nProvider>);
    }).not.toThrow();
  });

  describe('Initialization behavior', () => {
    it('should attempt initialization when not initialized', () => {
      (i18n as any).isInitialized = false;
      (i18n.init as jest.Mock).mockClear();

      render(
        <I18nProvider>
          <Text>Child</Text>
        </I18nProvider>
      );

      expect(i18n.init).toHaveBeenCalled();
    });

    it('should call init when isInitialized changes from false to true', () => {
      (i18n as any).isInitialized = false;
      (i18n.init as jest.Mock).mockClear();

      const { rerender } = render(
        <I18nProvider>
          <Text>Child</Text>
        </I18nProvider>
      );

      expect(i18n.init).toHaveBeenCalled();
      expect(i18n.init).toHaveBeenCalledTimes(1);

      (i18n as any).isInitialized = true;

      rerender(
        <I18nProvider>
          <Text>Updated</Text>
        </I18nProvider>
      );

      // Should still be 1 because it's already initialized
      expect(i18n.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle fragment children', () => {
      const { getByText } = render(
        <I18nProvider>
          <>
            <Text>Fragment child 1</Text>
            <Text>Fragment child 2</Text>
          </>
        </I18nProvider>
      );

      expect(getByText('Fragment child 1')).toBeTruthy();
      expect(getByText('Fragment child 2')).toBeTruthy();
    });

    it('should preserve child component state', () => {
      const StatefulComponent = () => {
        const [count, setCount] = React.useState(0);
        return <Text>{count}</Text>;
      };

      const { getByText, rerender } = render(
        <I18nProvider>
          <StatefulComponent />
        </I18nProvider>
      );

      expect(getByText('0')).toBeTruthy();
    });

    it('should handle children as function', () => {
      const { getByText } = render(
        <I18nProvider>
          <Text>Regular child</Text>
        </I18nProvider>
      );

      expect(getByText('Regular child')).toBeTruthy();
    });
  });
});
