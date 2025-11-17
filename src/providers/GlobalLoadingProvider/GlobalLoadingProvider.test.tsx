import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useIsMutating } from '@tanstack/react-query';
import { GlobalLoadingProvider } from './GlobalLoadingProvider';

jest.mock('@tanstack/react-query', () => ({
  useIsMutating: jest.fn(),
}));

jest.mock('@/components/ui/modal', () => {
  const React = require('react');
  return {
    Modal: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) => (
      isOpen ? <>{children}</> : null
    ),
    ModalBackdrop: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('@/components/ui/spinner', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Spinner: () => <Text testID="spinner">Loading...</Text>,
  };
});

jest.mock('@/components/ui/box', () => {
  const React = require('react');
  return {
    Box: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const mockedUseIsMutating = useIsMutating as jest.MockedFunction<typeof useIsMutating>;

describe('GlobalLoadingProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', () => {
    mockedUseIsMutating.mockReturnValue(0);

    render(
      <GlobalLoadingProvider>
        <Text testID="child">Child content</Text>
      </GlobalLoadingProvider>
    );

    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('should not show loading overlay when no mutations are running', () => {
    mockedUseIsMutating.mockReturnValue(0);

    render(
      <GlobalLoadingProvider>
        <Text>Child content</Text>
      </GlobalLoadingProvider>
    );

    expect(screen.queryByTestId('spinner')).toBeNull();
  });

  it('should show loading overlay when mutations are running', () => {
    mockedUseIsMutating.mockReturnValue(1);

    render(
      <GlobalLoadingProvider>
        <Text>Child content</Text>
      </GlobalLoadingProvider>
    );

    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('should show loading overlay when multiple mutations are running', () => {
    mockedUseIsMutating.mockReturnValue(3);

    render(
      <GlobalLoadingProvider>
        <Text>Child content</Text>
      </GlobalLoadingProvider>
    );

    expect(screen.getByTestId('spinner')).toBeTruthy();
  });
});
