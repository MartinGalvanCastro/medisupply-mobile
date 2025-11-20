import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useIsMutating } from '@tanstack/react-query';
import { GlobalLoadingProvider } from './GlobalLoadingProvider';

// Mock ONLY the hook - not UI components
jest.mock('@tanstack/react-query', () => ({
  useIsMutating: jest.fn(),
}));

// Mock rambda (utility function, not UI)
jest.mock('rambda', () => ({
  always: (value: any) => () => value,
}));

describe('GlobalLoadingProvider', () => {
  const mockUseIsMutating = useIsMutating as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when not loading (isMutating = 0)', () => {
    mockUseIsMutating.mockReturnValue(0);
    const { getByTestId } = render(
      <GlobalLoadingProvider>
        <Text testID="child">Test Child</Text>
      </GlobalLoadingProvider>
    );

    expect(getByTestId('child')).toBeTruthy();
  });

  it('should render children when loading (isMutating > 0)', () => {
    mockUseIsMutating.mockReturnValue(1);
    const { getByTestId } = render(
      <GlobalLoadingProvider>
        <Text testID="child">Test Child</Text>
      </GlobalLoadingProvider>
    );

    expect(getByTestId('child')).toBeTruthy();
  });

  it('should call useIsMutating hook', () => {
    mockUseIsMutating.mockReturnValue(0);
    render(
      <GlobalLoadingProvider>
        <Text>Child</Text>
      </GlobalLoadingProvider>
    );

    expect(mockUseIsMutating).toHaveBeenCalled();
  });

  it('should render multiple children', () => {
    mockUseIsMutating.mockReturnValue(0);
    const { getByTestId } = render(
      <GlobalLoadingProvider>
        <Text testID="child-1">First</Text>
        <Text testID="child-2">Second</Text>
      </GlobalLoadingProvider>
    );

    expect(getByTestId('child-1')).toBeTruthy();
    expect(getByTestId('child-2')).toBeTruthy();
  });
});
