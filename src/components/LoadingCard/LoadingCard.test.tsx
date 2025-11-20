import { render, fireEvent } from '@testing-library/react-native';
import { LoadingCard } from './LoadingCard';

describe('LoadingCard', () => {
  it('should render with default message', () => {
    const { getByText } = render(<LoadingCard />);

    expect(getByText('Loading...')).toBeDefined();
  });

  it('should render with custom message', () => {
    const { getByText } = render(<LoadingCard message="Fetching data..." />);

    expect(getByText('Fetching data...')).toBeDefined();
  });

  it('should render spinner by default', () => {
    const { getByTestId } = render(<LoadingCard />);

    expect(getByTestId('loading-card-spinner')).toBeDefined();
  });

  it('should render card with correct testID', () => {
    const { getByTestId } = render(<LoadingCard />);

    expect(getByTestId('loading-card')).toBeDefined();
  });

  it('should not render back button by default', () => {
    const { queryByTestId } = render(<LoadingCard />);

    expect(queryByTestId('loading-card-back-button')).toBeNull();
  });

  it('should render back button when showBackButton is true', () => {
    const mockOnBack = jest.fn();
    const { getByTestId } = render(
      <LoadingCard showBackButton={true} onBack={mockOnBack} />
    );

    expect(getByTestId('loading-card-back-button')).toBeDefined();
  });

  it('should call onBack when back button is pressed', () => {
    const mockOnBack = jest.fn();
    const { getByTestId } = render(
      <LoadingCard showBackButton={true} onBack={mockOnBack} />
    );

    const backButton = getByTestId('loading-card-back-button');
    fireEvent.press(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should not render back button when showBackButton is true but onBack is not provided', () => {
    const { queryByTestId } = render(
      <LoadingCard showBackButton={true} />
    );

    expect(queryByTestId('loading-card-back-button')).toBeNull();
  });

  it('should use custom testID when provided', () => {
    const { getByTestId } = render(
      <LoadingCard testID="custom-loading" />
    );

    expect(getByTestId('custom-loading')).toBeDefined();
    expect(getByTestId('custom-loading-spinner')).toBeDefined();
    expect(getByTestId('custom-loading-message')).toBeDefined();
  });

  it('should render message with correct testID', () => {
    const { getByTestId } = render(
      <LoadingCard message="Processing..." />
    );

    expect(getByTestId('loading-card-message')).toBeDefined();
  });

  it('should render all elements together', () => {
    const mockOnBack = jest.fn();
    const { getByTestId, getByText } = render(
      <LoadingCard
        message="Loading data..."
        showBackButton={true}
        onBack={mockOnBack}
      />
    );

    expect(getByTestId('loading-card')).toBeDefined();
    expect(getByTestId('loading-card-spinner')).toBeDefined();
    expect(getByText('Loading data...')).toBeDefined();
    expect(getByTestId('loading-card-back-button')).toBeDefined();
  });
});
