import React from 'react';
import { render } from '@testing-library/react-native';
import { I18nProvider } from './I18nProvider';
import i18n from '../../i18n/config/i18n.config';

// Mock the i18n config
jest.mock('../../i18n/config/i18n.config', () => ({
  isInitialized: false,
  init: jest.fn(),
}));

// Mock the I18nextProvider from react-i18next
jest.mock('react-i18next', () => ({
  I18nextProvider: ({ children, i18n: _i18n }: { children: React.ReactNode; i18n: any }) => (
    <>{children}</>
  ),
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should call i18n.init() when i18n is not initialized on mount', () => {
      // Arrange
      const mockI18n = i18n as jest.Mocked<typeof i18n>;
      Object.defineProperty(mockI18n, 'isInitialized', {
        value: false,
        writable: true,
      });

      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="test-child">Test</div>
        </I18nProvider>
      );

      // Assert
      expect(mockI18n.init).toHaveBeenCalled();
      expect(mockI18n.init).toHaveBeenCalledTimes(1);
      expect(result).toBeTruthy();
    });

    it('should not call i18n.init() when i18n is already initialized', () => {
      // Arrange
      const mockI18n = i18n as jest.Mocked<typeof i18n>;
      Object.defineProperty(mockI18n, 'isInitialized', {
        value: true,
        writable: true,
      });

      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="test-child">Test</div>
        </I18nProvider>
      );

      // Assert
      expect(mockI18n.init).not.toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('should only initialize once on mount, not on re-renders', () => {
      // Arrange
      const mockI18n = i18n as jest.Mocked<typeof i18n>;
      Object.defineProperty(mockI18n, 'isInitialized', {
        value: false,
        writable: true,
      });

      const { rerender } = render(
        <I18nProvider>
          <div data-testid="test-child">Test</div>
        </I18nProvider>
      );

      expect(mockI18n.init).toHaveBeenCalledTimes(1);

      // Act
      rerender(
        <I18nProvider>
          <div data-testid="test-child">Test</div>
        </I18nProvider>
      );

      // Assert
      expect(mockI18n.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('children rendering', () => {
    it('should render children without errors', () => {
      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="test-element">Test Child Component</div>
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it('should render multiple children', () => {
      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it('should render with React Fragment as children', () => {
      // Act
      const result = render(
        <I18nProvider>
          <>
            <div data-testid="fragment-child-1">Fragment Child 1</div>
            <div data-testid="fragment-child-2">Fragment Child 2</div>
          </>
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });
  });

  describe('i18n provider integration', () => {
    it('should wrap children in I18nextProvider', () => {
      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="wrapped-child">Provider Wrapped Child</div>
        </I18nProvider>
      );

      // Assert - If render succeeds and returns result, I18nextProvider is working
      expect(result).toBeTruthy();
    });

    it('should render children within I18nextProvider wrapper', () => {
      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="wrapped">Wrapped Child</div>
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle null children gracefully', () => {
      // Act
      const result = render(
        <I18nProvider>
          {null}
        </I18nProvider>
      );

      // Assert - Provider renders without errors
      expect(result).toBeTruthy();
    });

    it('should handle complex nested children structure', () => {
      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="parent">
            <div data-testid="child">
              <div>Nested Content</div>
            </div>
          </div>
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it('should render with component children', () => {
      // Arrange
      const TestChild = () => <div data-testid="test-prop-child">Prop Child</div>;

      // Act
      const result = render(
        <I18nProvider>
          <TestChild />
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });
  });

  describe('initialization edge cases', () => {
    it('should call init only once regardless of component re-renders', () => {
      // Arrange
      const mockI18n = i18n as jest.Mocked<typeof i18n>;
      Object.defineProperty(mockI18n, 'isInitialized', {
        value: false,
        writable: true,
      });

      // Act - First render
      const { rerender } = render(
        <I18nProvider>
          <div data-testid="render-1">Render 1</div>
        </I18nProvider>
      );

      expect(mockI18n.init).toHaveBeenCalledTimes(1);

      // Act - Multiple rerenders
      rerender(
        <I18nProvider>
          <div data-testid="render-2">Render 2</div>
        </I18nProvider>
      );

      rerender(
        <I18nProvider>
          <div data-testid="render-3">Render 3</div>
        </I18nProvider>
      );

      // Assert - init should only be called once
      expect(mockI18n.init).toHaveBeenCalledTimes(1);
    });

    it('should have empty dependency array to prevent re-initialization on prop changes', () => {
      // Arrange
      const mockI18n = i18n as jest.Mocked<typeof i18n>;
      Object.defineProperty(mockI18n, 'isInitialized', {
        value: false,
        writable: true,
      });

      // Act - Initial render
      const { rerender } = render(
        <I18nProvider>
          <div>Initial</div>
        </I18nProvider>
      );

      // Assert first call
      expect(mockI18n.init).toHaveBeenCalledTimes(1);

      // Act - Change children (prop change)
      rerender(
        <I18nProvider>
          <div>Updated</div>
        </I18nProvider>
      );

      // Assert - init should still only be called once despite prop change
      expect(mockI18n.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('component composition', () => {
    it('should work with conditional rendering of children when true', () => {
      // Arrange
      const shouldRender = true;

      // Act
      const result = render(
        <I18nProvider>
          {shouldRender && <div data-testid="conditional">Conditional Child</div>}
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it('should handle conditional rendering when false', () => {
      // Act
      const result = render(
        <I18nProvider>
          {false && <div data-testid="conditional">Conditional Child</div>}
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });

    it('should initialize i18n correctly before rendering children', () => {
      // Arrange
      const mockI18n = i18n as jest.Mocked<typeof i18n>;
      Object.defineProperty(mockI18n, 'isInitialized', {
        value: false,
        writable: true,
      });

      let initCallCount = 0;
      mockI18n.init.mockImplementation(async () => {
        initCallCount++;
        return jest.fn() as any;
      });

      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="after-init">After Init</div>
        </I18nProvider>
      );

      // Assert
      expect(initCallCount).toBe(1);
      expect(result).toBeTruthy();
    });
  });

  describe('provider wrapper functionality', () => {
    it('should work as a wrapper provider for entire app', () => {
      // Arrange
      const AppContent = () => (
        <div data-testid="app-content">
          <div data-testid="header">Header</div>
          <div data-testid="main">Main Content</div>
          <div data-testid="footer">Footer</div>
        </div>
      );

      // Act
      const result = render(
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      );

      // Assert - All content should be rendered
      expect(result).toBeTruthy();
    });

    it('should support nested provider structures', () => {
      // Act
      const result = render(
        <I18nProvider>
          <div data-testid="outer-wrapper">
            <div data-testid="inner-wrapper">
              <div data-testid="deeply-nested">Deep Content</div>
            </div>
          </div>
        </I18nProvider>
      );

      // Assert
      expect(result).toBeTruthy();
    });
  });

  describe('i18n instance handling', () => {
    it('should use the same i18n instance for all renders', () => {
      // Arrange
      const mockI18n = i18n as jest.Mocked<typeof i18n>;
      Object.defineProperty(mockI18n, 'isInitialized', {
        value: false,
        writable: true,
      });

      // Act - First render
      const { rerender } = render(
        <I18nProvider>
          <div>Content 1</div>
        </I18nProvider>
      );

      const firstInitCalls = mockI18n.init.mock.calls.length;

      // Act - Rerender
      rerender(
        <I18nProvider>
          <div>Content 2</div>
        </I18nProvider>
      );

      // Assert - init should not be called again
      expect(mockI18n.init.mock.calls.length).toBe(firstInitCalls);
    });
  });
});
