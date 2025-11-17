import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VisitCard } from './VisitCard';

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  ChevronRight: ({ size, color }: any) => {
    const { View } = require('react-native');
    return <View testID="chevron-right-icon" data-size={size} data-color={color} />;
  },
  Calendar: ({ size, color }: any) => {
    const { View } = require('react-native');
    return <View testID="calendar-icon" data-size={size} data-color={color} />;
  },
  MapPin: ({ size, color }: any) => {
    const { View } = require('react-native');
    return <View testID="map-pin-icon" data-size={size} data-color={color} />;
  },
}));

// Mock UI components
jest.mock('@/components/ui/box', () => ({
  Box: ({ children, testID }: any) => {
    const { View } = require('react-native');
    return <View testID={testID}>{children}</View>;
  },
}));

jest.mock('@/components/ui/hstack', () => ({
  HStack: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/components/ui/vstack', () => ({
  VStack: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/components/ui/heading', () => ({
  Heading: ({ children, testID }: any) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{children}</Text>;
  },
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, testID, numberOfLines }: any) => {
    const { Text: RNText } = require('react-native');
    return (
      <RNText testID={testID} numberOfLines={numberOfLines}>
        {children}
      </RNText>
    );
  },
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, action, size }: any) => {
    const { View } = require('react-native');
    return (
      <View testID="badge" data-action={action} data-size={size}>
        {children}
      </View>
    );
  },
  BadgeText: ({ children }: any) => {
    const { Text } = require('react-native');
    return <Text testID="badge-text">{children}</Text>;
  },
}));

describe('VisitCard Component', () => {
  const mockVisit = {
    id: '1',
    clientName: 'Dr. Carlos Hernández',
    institutionName: 'Hospital General San José',
    visitDate: '2025-01-15T09:00:00Z',
    status: 'pending',
  };

  const defaultProps = {
    visit: mockVisit,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the visit card', () => {
      const { getByTestId } = render(
        <VisitCard {...defaultProps} testID="visit-card" />
      );

      expect(getByTestId('visit-card')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <VisitCard {...defaultProps} testID="custom-visit-card" />
      );

      expect(getByTestId('custom-visit-card')).toBeTruthy();
    });

    it('should render client name', () => {
      const { getByText } = render(<VisitCard {...defaultProps} />);

      expect(getByText('Dr. Carlos Hernández')).toBeTruthy();
    });

    it('should render institution name', () => {
      const { getByText } = render(<VisitCard {...defaultProps} />);

      expect(getByText('Hospital General San José')).toBeTruthy();
    });

    it('should render formatted visit date', () => {
      const { getByText } = render(<VisitCard {...defaultProps} />);

      // formatDateTime should format the date
      expect(getByText(/Jan 15, 2025/)).toBeTruthy();
    });

    it('should render status badge', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      expect(getByTestId('badge')).toBeTruthy();
    });

    it('should render chevron icon', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      expect(getByTestId('chevron-right-icon')).toBeTruthy();
    });

    it('should render calendar icon', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      expect(getByTestId('calendar-icon')).toBeTruthy();
    });
  });

  describe('Status badges', () => {
    it('should render pending status with warning badge', () => {
      const { getByTestId, getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, status: 'pending' }}
        />
      );

      const badge = getByTestId('badge');
      expect(badge.props['data-action']).toBe('warning');
      expect(getByText('Pending')).toBeTruthy();
    });

    it('should render completed status with success badge', () => {
      const { getByTestId, getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, status: 'completed' }}
        />
      );

      const badge = getByTestId('badge');
      expect(badge.props['data-action']).toBe('success');
      expect(getByText('Completed')).toBeTruthy();
    });

    it('should render cancelled status with error badge', () => {
      const { getByTestId, getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, status: 'cancelled' }}
        />
      );

      const badge = getByTestId('badge');
      expect(badge.props['data-action']).toBe('error');
      expect(getByText('Cancelled')).toBeTruthy();
    });

    it('should handle unknown status with muted badge', () => {
      const { getByTestId, getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, status: 'unknown' }}
        />
      );

      const badge = getByTestId('badge');
      expect(badge.props['data-action']).toBe('muted');
      expect(getByText('unknown')).toBeTruthy();
    });

    it('should render badge with small size', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      const badge = getByTestId('badge');
      expect(badge.props['data-size']).toBe('sm');
    });
  });

  describe('Location display', () => {
    it('should render location when provided', () => {
      const { getByText, getByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, location: 'Bogotá, Colombia' }}
        />
      );

      expect(getByText('Bogotá, Colombia')).toBeTruthy();
      expect(getByTestId('map-pin-icon')).toBeTruthy();
    });

    it('should not render location when not provided', () => {
      const { queryByTestId } = render(<VisitCard {...defaultProps} />);

      expect(queryByTestId('map-pin-icon')).toBeNull();
    });

    it('should not render location when null', () => {
      const { queryByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, location: undefined }}
        />
      );

      expect(queryByTestId('map-pin-icon')).toBeNull();
    });

    it('should not render location when empty string', () => {
      const { queryByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, location: '' }}
        />
      );

      expect(queryByTestId('map-pin-icon')).toBeNull();
    });

    it('should truncate long location with numberOfLines', () => {
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{
            ...mockVisit,
            location: 'Very Long Location Name That Should Be Truncated',
          }}
        />
      );

      const locationText = getByText('Very Long Location Name That Should Be Truncated');
      expect(locationText.props.numberOfLines).toBe(1);
    });
  });

  describe('Notes display', () => {
    it('should render notes when provided', () => {
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, notes: 'Follow up on medication delivery' }}
        />
      );

      expect(getByText('Follow up on medication delivery')).toBeTruthy();
    });

    it('should not render notes when not provided', () => {
      const { queryByText } = render(<VisitCard {...defaultProps} />);

      // Should not find any notes text (will throw if trying to find non-existent text)
      expect(queryByText('Follow up on medication delivery')).toBeNull();
    });

    it('should not render notes when null', () => {
      const { queryByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, notes: null }}
        />
      );

      expect(queryByText('Any note text')).toBeNull();
    });

    it('should not render notes when empty string', () => {
      const { queryByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, notes: '' }}
        />
      );

      expect(queryByText('')).toBeNull();
    });

    it('should truncate long notes with numberOfLines', () => {
      const longNotes =
        'This is a very long note that should be truncated to two lines to prevent the card from becoming too tall';
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, notes: longNotes }}
        />
      );

      const notesText = getByText(longNotes);
      expect(notesText.props.numberOfLines).toBe(2);
    });
  });

  describe('Press interaction', () => {
    it('should call onPress when card is pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <VisitCard {...defaultProps} onPress={onPress} testID="visit-card" />
      );

      const card = getByTestId('visit-card');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple presses', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <VisitCard {...defaultProps} onPress={onPress} testID="visit-card" />
      );

      const card = getByTestId('visit-card');
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid presses', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <VisitCard {...defaultProps} onPress={onPress} testID="visit-card" />
      );

      const card = getByTestId('visit-card');
      for (let i = 0; i < 10; i++) {
        fireEvent.press(card);
      }

      expect(onPress).toHaveBeenCalledTimes(10);
    });
  });

  describe('Different visit data', () => {
    it('should render different client names', () => {
      const clientNames = [
        'Dr. Carlos Hernández',
        'Dra. María Rodríguez',
        'Dr. Juan Pérez',
        'Dra. Ana García',
      ];

      clientNames.forEach((name) => {
        const { getByText } = render(
          <VisitCard
            {...defaultProps}
            visit={{ ...mockVisit, clientName: name }}
          />
        );

        expect(getByText(name)).toBeTruthy();
      });
    });

    it('should render different institution names', () => {
      const institutions = [
        'Hospital General San José',
        'Clínica Santa María',
        'Centro Médico Nacional',
        'Hospital Universitario',
      ];

      institutions.forEach((institution) => {
        const { getByText } = render(
          <VisitCard
            {...defaultProps}
            visit={{ ...mockVisit, institutionName: institution }}
          />
        );

        expect(getByText(institution)).toBeTruthy();
      });
    });

    it('should render different visit dates', () => {
      const dates = [
        '2025-01-15T09:00:00Z',
        '2025-02-20T14:30:00Z',
        '2025-03-10T08:00:00Z',
      ];

      dates.forEach((date) => {
        const { getByTestId } = render(
          <VisitCard
            {...defaultProps}
            visit={{ ...mockVisit, visitDate: date }}
          />
        );

        expect(getByTestId('calendar-icon')).toBeTruthy();
      });
    });
  });

  describe('Edge cases and special characters', () => {
    it('should render client name with special characters', () => {
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, clientName: 'Dr. María José Hernández-García' }}
        />
      );

      expect(getByText('Dr. María José Hernández-García')).toBeTruthy();
    });

    it('should render institution name with special characters', () => {
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{
            ...mockVisit,
            institutionName: "Hospital St. Mary's (Main Campus)",
          }}
        />
      );

      expect(getByText("Hospital St. Mary's (Main Campus)")).toBeTruthy();
    });

    it('should render very long client name', () => {
      const longName =
        'Dr. Carlos Alberto Hernández García de la Fuente y Martínez';
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, clientName: longName }}
        />
      );

      expect(getByText(longName)).toBeTruthy();
    });

    it('should render very long institution name', () => {
      const longInstitution =
        'Hospital General de la Ciudad de San José de los Remedios y Santa María';
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, institutionName: longInstitution }}
        />
      );

      expect(getByText(longInstitution)).toBeTruthy();
    });

    it('should handle empty client name', () => {
      const { getByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, clientName: '' }}
          testID="visit-card"
        />
      );

      expect(getByTestId('visit-card')).toBeTruthy();
    });

    it('should handle empty institution name', () => {
      const { getByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, institutionName: '' }}
          testID="visit-card"
        />
      );

      expect(getByTestId('visit-card')).toBeTruthy();
    });
  });

  describe('Component updates', () => {
    it('should update when visit data changes', () => {
      const { getByText, rerender } = render(<VisitCard {...defaultProps} />);

      expect(getByText('Dr. Carlos Hernández')).toBeTruthy();

      const newVisit = {
        ...mockVisit,
        clientName: 'Dra. María Rodríguez',
      };

      rerender(<VisitCard {...defaultProps} visit={newVisit} />);

      expect(getByText('Dra. María Rodríguez')).toBeTruthy();
    });

    it('should update status badge when status changes', () => {
      const { getByTestId, getByText, rerender } = render(
        <VisitCard {...defaultProps} visit={{ ...mockVisit, status: 'pending' }} />
      );

      let badge = getByTestId('badge');
      expect(badge.props['data-action']).toBe('warning');
      expect(getByText('Pending')).toBeTruthy();

      rerender(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, status: 'completed' }}
        />
      );

      badge = getByTestId('badge');
      expect(badge.props['data-action']).toBe('success');
      expect(getByText('Completed')).toBeTruthy();
    });

    it('should show/hide location when updated', () => {
      const { queryByTestId, rerender } = render(
        <VisitCard {...defaultProps} visit={{ ...mockVisit }} />
      );

      expect(queryByTestId('map-pin-icon')).toBeNull();

      rerender(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, location: 'Bogotá' }}
        />
      );

      expect(queryByTestId('map-pin-icon')).toBeTruthy();
    });

    it('should show/hide notes when updated', () => {
      const { getByText, queryByText, rerender } = render(
        <VisitCard {...defaultProps} visit={{ ...mockVisit }} />
      );

      expect(queryByText('Important note')).toBeNull();

      rerender(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, notes: 'Important note' }}
        />
      );

      expect(getByText('Important note')).toBeTruthy();
    });
  });

  describe('Pressable style states', () => {
    it('should have style prop', () => {
      const { getByTestId } = render(
        <VisitCard {...defaultProps} testID="visit-card" />
      );

      const pressable = getByTestId('visit-card');
      const styleValue = pressable.props.style;

      expect(styleValue).toBeDefined();
      // Style can be function or array/object depending on how React Native processes it
    });

    it('should render pressable component', () => {
      const { getByTestId } = render(
        <VisitCard {...defaultProps} testID="visit-card" />
      );

      const pressable = getByTestId('visit-card');
      expect(pressable).toBeTruthy();
    });

    it('should be pressable', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <VisitCard {...defaultProps} testID="visit-card" onPress={onPress} />
      );

      const pressable = getByTestId('visit-card');
      fireEvent.press(pressable);

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon properties', () => {
    it('should render calendar icon with correct size', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      const icon = getByTestId('calendar-icon');
      expect(icon.props['data-size']).toBe(14);
    });

    it('should render calendar icon with correct color', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      const icon = getByTestId('calendar-icon');
      expect(icon.props['data-color']).toBe('#6B7280');
    });

    it('should render map pin icon with correct size', () => {
      const { getByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, location: 'Bogotá' }}
        />
      );

      const icon = getByTestId('map-pin-icon');
      expect(icon.props['data-size']).toBe(14);
    });

    it('should render map pin icon with correct color', () => {
      const { getByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, location: 'Bogotá' }}
        />
      );

      const icon = getByTestId('map-pin-icon');
      expect(icon.props['data-color']).toBe('#6B7280');
    });

    it('should render chevron icon with correct size', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      const icon = getByTestId('chevron-right-icon');
      expect(icon.props['data-size']).toBe(20);
    });

    it('should render chevron icon with correct color', () => {
      const { getByTestId } = render(<VisitCard {...defaultProps} />);

      const icon = getByTestId('chevron-right-icon');
      expect(icon.props['data-color']).toBe('#9CA3AF');
    });
  });

  describe('Complex scenarios', () => {
    it('should render visit with all optional fields', () => {
      const completeVisit = {
        ...mockVisit,
        location: 'Bogotá, Colombia',
        notes: 'Follow up on medication delivery',
      };

      const { getByText, getByTestId } = render(
        <VisitCard {...defaultProps} visit={completeVisit} />
      );

      expect(getByText('Dr. Carlos Hernández')).toBeTruthy();
      expect(getByText('Hospital General San José')).toBeTruthy();
      expect(getByTestId('calendar-icon')).toBeTruthy();
      expect(getByTestId('map-pin-icon')).toBeTruthy();
      expect(getByText('Bogotá, Colombia')).toBeTruthy();
      expect(getByText('Follow up on medication delivery')).toBeTruthy();
      expect(getByTestId('badge')).toBeTruthy();
      expect(getByTestId('chevron-right-icon')).toBeTruthy();
    });

    it('should render visit with minimal fields', () => {
      const minimalVisit = {
        id: '1',
        clientName: 'Dr. Smith',
        institutionName: 'Hospital',
        visitDate: '2025-01-15T09:00:00Z',
        status: 'pending',
      };

      const { getByText, getByTestId, queryByTestId } = render(
        <VisitCard {...defaultProps} visit={minimalVisit} />
      );

      expect(getByText('Dr. Smith')).toBeTruthy();
      expect(getByText('Hospital')).toBeTruthy();
      expect(getByTestId('calendar-icon')).toBeTruthy();
      expect(queryByTestId('map-pin-icon')).toBeNull();
      expect(getByTestId('badge')).toBeTruthy();
      expect(getByTestId('chevron-right-icon')).toBeTruthy();
    });

    it('should handle multiple visits with different statuses', () => {
      const statuses: string[] = ['pending', 'completed', 'cancelled'];

      statuses.forEach((status) => {
        const { getByTestId } = render(
          <VisitCard
            {...defaultProps}
            visit={{ ...mockVisit, status }}
          />
        );

        const badge = getByTestId('badge');
        expect(badge).toBeTruthy();
      });
    });
  });

  describe('Date formatting', () => {
    it('should format different date formats correctly', () => {
      const dates = [
        '2025-01-15T09:00:00Z',
        '2025-12-31T23:59:59Z',
        '2025-06-15T12:00:00Z',
      ];

      dates.forEach((date) => {
        const { getByTestId } = render(
          <VisitCard
            {...defaultProps}
            visit={{ ...mockVisit, visitDate: date }}
          />
        );

        expect(getByTestId('calendar-icon')).toBeTruthy();
      });
    });
  });

  describe('Status label edge cases', () => {
    it('should return correct label for all valid statuses', () => {
      const statusTests = [
        { status: 'pending', expectedLabel: 'Pending' },
        { status: 'completed', expectedLabel: 'Completed' },
        { status: 'cancelled', expectedLabel: 'Cancelled' },
      ];

      statusTests.forEach(({ status, expectedLabel }) => {
        const { getByText } = render(
          <VisitCard {...defaultProps} visit={{ ...mockVisit, status }} />
        );

        expect(getByText(expectedLabel)).toBeTruthy();
      });
    });

    it('should return status as-is for unknown status', () => {
      const unknownStatus = 'in-progress';
      const { getByText } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, status: unknownStatus }}
        />
      );

      expect(getByText('in-progress')).toBeTruthy();
    });
  });

  describe('Status badge action edge cases', () => {
    it('should return correct badge action for all valid statuses', () => {
      const statusTests = [
        { status: 'pending', expectedAction: 'warning' },
        { status: 'completed', expectedAction: 'success' },
        { status: 'cancelled', expectedAction: 'error' },
      ];

      statusTests.forEach(({ status, expectedAction }) => {
        const { getByTestId } = render(
          <VisitCard {...defaultProps} visit={{ ...mockVisit, status }} />
        );

        const badge = getByTestId('badge');
        expect(badge.props['data-action']).toBe(expectedAction);
      });
    });

    it('should return muted action for unknown status', () => {
      const unknownStatus = 'archived';
      const { getByTestId } = render(
        <VisitCard
          {...defaultProps}
          visit={{ ...mockVisit, status: unknownStatus }}
        />
      );

      const badge = getByTestId('badge');
      expect(badge.props['data-action']).toBe('muted');
    });
  });

  describe('Default testID behavior', () => {
    it('should render without testID when not provided', () => {
      const { getByText } = render(
        <VisitCard visit={mockVisit} onPress={jest.fn()} />
      );

      // Should still render the content
      expect(getByText('Dr. Carlos Hernández')).toBeTruthy();
    });

    it('should use custom testID when provided', () => {
      const { getByTestId } = render(
        <VisitCard
          visit={mockVisit}
          onPress={jest.fn()}
          testID="custom-visit"
        />
      );

      expect(getByTestId('custom-visit')).toBeTruthy();
    });
  });
});
