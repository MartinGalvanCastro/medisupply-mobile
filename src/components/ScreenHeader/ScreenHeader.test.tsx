import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ScreenHeader } from './ScreenHeader';

describe('ScreenHeader', () => {
  it('should render with title', () => {
    const { getByText, getByTestId } = render(
      <ScreenHeader title="Test Title" />
    );

    expect(getByText('Test Title')).toBeDefined();
    expect(getByTestId('screen-header')).toBeDefined();
    expect(getByTestId('screen-header-title')).toBeDefined();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = render(
      <ScreenHeader title="Test" testID="custom-header" />
    );

    expect(getByTestId('custom-header')).toBeDefined();
    expect(getByTestId('custom-header-title')).toBeDefined();
  });

  it('should not show back button when showBackButton is false', () => {
    const { queryByTestId } = render(
      <ScreenHeader title="Test" showBackButton={false} />
    );

    expect(queryByTestId('screen-header-back-button')).toBeNull();
  });

  it('should show back button when showBackButton is true and onBack provided', () => {
    const mockOnBack = jest.fn();
    const { getByTestId } = render(
      <ScreenHeader title="Test" showBackButton={true} onBack={mockOnBack} />
    );

    expect(getByTestId('screen-header-back-button')).toBeDefined();
  });

  it('should not show back button when showBackButton is true but onBack is not provided', () => {
    const { queryByTestId } = render(
      <ScreenHeader title="Test" showBackButton={true} />
    );

    expect(queryByTestId('screen-header-back-button')).toBeNull();
  });

  it('should call onBack callback when back button is pressed', () => {
    const mockOnBack = jest.fn();
    const { getByTestId } = render(
      <ScreenHeader title="Test" showBackButton={true} onBack={mockOnBack} />
    );

    fireEvent.press(getByTestId('screen-header-back-button'));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should call onBack multiple times when back button is pressed multiple times', () => {
    const mockOnBack = jest.fn();
    const { getByTestId } = render(
      <ScreenHeader title="Test" showBackButton={true} onBack={mockOnBack} />
    );

    const backButton = getByTestId('screen-header-back-button');
    fireEvent.press(backButton);
    fireEvent.press(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(2);
  });

  it('should render both back button and title with custom testID', () => {
    const mockOnBack = jest.fn();
    const { getByTestId } = render(
      <ScreenHeader
        title="Custom Title"
        showBackButton={true}
        onBack={mockOnBack}
        testID="custom-test"
      />
    );

    expect(getByTestId('custom-test')).toBeDefined();
    expect(getByTestId('custom-test-back-button')).toBeDefined();
    expect(getByTestId('custom-test-title')).toBeDefined();
  });

  it('should display correct title text', () => {
    const { getByText } = render(
      <ScreenHeader title="My Screen Title" />
    );

    expect(getByText('My Screen Title')).toBeDefined();
  });

  it('should have default testID of screen-header', () => {
    const { getByTestId } = render(
      <ScreenHeader title="Test" />
    );

    expect(getByTestId('screen-header')).toBeDefined();
  });
});
