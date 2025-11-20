import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VisitCard } from './VisitCard';

jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'visits.status.pending': 'Pending',
        'visits.status.completed': 'Completed',
        'visits.status.cancelled': 'Cancelled',
        'visits.status.programada': 'Scheduled',
        'visits.status.completada': 'Completed',
        'visits.status.cancelada': 'Cancelled',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/utils/formatDate', () => ({
  formatDateTime: (date: string) => '2025-01-15, 9:00 AM',
}));

jest.mock('@/utils/getVisitStatusBadgeAction', () => ({
  getVisitStatusBadgeAction: (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'error',
    };
    return statusMap[status?.toLowerCase()] || 'muted';
  },
}));

describe('VisitCard', () => {
  const mockVisit = {
    id: '1',
    clientName: 'John Doe',
    institutionName: 'Test Hospital',
    visitDate: '2025-01-15T09:00:00',
    status: 'pending',
    location: '123 Main St',
    notes: 'Test notes',
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render visit card with all details', () => {
    const { getByText, getByTestId } = render(
      <VisitCard visit={mockVisit} onPress={mockOnPress} />
    );

    expect(getByText('John Doe')).toBeDefined();
    expect(getByText('Test Hospital')).toBeDefined();
    expect(getByText('2025-01-15, 9:00 AM')).toBeDefined();
    expect(getByText('123 Main St')).toBeDefined();
    expect(getByText('Test notes')).toBeDefined();
    expect(getByText('Pending')).toBeDefined();
  });

  it('should render without location when not provided', () => {
    const visitWithoutLocation = { ...mockVisit, location: undefined };
    const { getByText, queryByText } = render(
      <VisitCard visit={visitWithoutLocation} onPress={mockOnPress} />
    );

    expect(getByText('John Doe')).toBeDefined();
    expect(queryByText('123 Main St')).toBeNull();
  });

  it('should render without notes when not provided', () => {
    const visitWithoutNotes = { ...mockVisit, notes: null };
    const { getByText, queryByText } = render(
      <VisitCard visit={visitWithoutNotes} onPress={mockOnPress} />
    );

    expect(getByText('John Doe')).toBeDefined();
    expect(queryByText('Test notes')).toBeNull();
  });

  it('should call onPress when card is pressed', () => {
    const { getByTestId } = render(
      <VisitCard visit={mockVisit} onPress={mockOnPress} testID="visit-card" />
    );

    fireEvent.press(getByTestId('visit-card'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should use custom testID when provided', () => {
    const { getByTestId } = render(
      <VisitCard visit={mockVisit} onPress={mockOnPress} testID="custom-card" />
    );

    expect(getByTestId('custom-card')).toBeDefined();
  });

  it('should display correct status label for completed status', () => {
    const completedVisit = { ...mockVisit, status: 'completed' };
    const { getByText } = render(
      <VisitCard visit={completedVisit} onPress={mockOnPress} />
    );

    expect(getByText('Completed')).toBeDefined();
  });

  it('should display correct status label for cancelled status', () => {
    const cancelledVisit = { ...mockVisit, status: 'cancelled' };
    const { getByText } = render(
      <VisitCard visit={cancelledVisit} onPress={mockOnPress} />
    );

    expect(getByText('Cancelled')).toBeDefined();
  });

  it('should render location when provided', () => {
    const { getByText } = render(
      <VisitCard visit={mockVisit} onPress={mockOnPress} />
    );

    expect(getByText('123 Main St')).toBeDefined();
  });

  it('should render notes when provided', () => {
    const { getByText } = render(
      <VisitCard visit={mockVisit} onPress={mockOnPress} />
    );

    expect(getByText('Test notes')).toBeDefined();
  });

  it('should call onPress multiple times when pressed multiple times', () => {
    const { getByTestId } = render(
      <VisitCard visit={mockVisit} onPress={mockOnPress} testID="visit-card" />
    );

    const card = getByTestId('visit-card');
    fireEvent.press(card);
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(2);
  });

  it('should render visit date correctly', () => {
    const { getByText } = render(
      <VisitCard visit={mockVisit} onPress={mockOnPress} />
    );

    expect(getByText('2025-01-15, 9:00 AM')).toBeDefined();
  });

  it('should render with null notes property', () => {
    const visitWithNullNotes = { ...mockVisit, notes: null };
    const { getByText, queryByText } = render(
      <VisitCard visit={visitWithNullNotes} onPress={mockOnPress} />
    );

    expect(getByText('John Doe')).toBeDefined();
    expect(queryByText('Test notes')).toBeNull();
  });
});
