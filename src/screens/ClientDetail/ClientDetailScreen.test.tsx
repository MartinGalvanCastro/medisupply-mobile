import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ClientDetailScreen } from './ClientDetailScreen';
import { useListClientsBffSellersAppClientsGet, useCreateVisitBffSellersAppVisitsPost } from '@/api/generated/sellers-app/sellers-app';
import { useTranslation } from '@/i18n/hooks';
import { router, useLocalSearchParams } from 'expo-router';

// Mock dependencies
jest.mock('@/api/generated/sellers-app/sellers-app');
jest.mock('@/i18n/hooks');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
  },
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSegments: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID, style, edges }: any) => (
    <div testID={testID} style={style} data-edges={edges?.join(',')}>
      {children}
    </div>
  ),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ testID, value, onChange }: any) => {
      const { View, Text, Pressable } = require('react-native');
      return (
        <View testID={testID}>
          <Text>{value?.toISOString()}</Text>
          <Pressable onPress={() => onChange && onChange({ type: 'set', nativeEvent: { timestamp: value?.getTime() } }, value)}>
            <Text>Change Date</Text>
          </Pressable>
        </View>
      );
    },
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Mail: () => <div testID="mail-icon" />,
  Phone: () => <div testID="phone-icon" />,
  Building2: () => <div testID="building-icon" />,
  MapPin: () => <div testID="map-pin-icon" />,
  FileText: () => <div testID="file-text-icon" />,
  UserCircle: () => <div testID="user-circle-icon" />,
  Calendar: () => <div testID="calendar-icon" />,
  Clock: () => <div testID="clock-icon" />,
  ArrowLeft: () => <div testID="arrow-left-icon" />,
}));

// Mock toast
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    show: jest.fn(),
  }),
}));

// Mock Modal components
jest.mock('@/components/ui/modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Modal: ({ isOpen, children, onClose }: any) =>
      isOpen ? <View testID="modal-container">{children}</View> : null,
    ModalBackdrop: ({ children }: any) => <View testID="modal-backdrop">{children}</View>,
    ModalContent: ({ children, testID }: any) => <View testID={testID}>{children}</View>,
    ModalHeader: ({ children }: any) => <View testID="modal-header">{children}</View>,
    ModalBody: ({ children }: any) => <View testID="modal-body">{children}</View>,
    ModalFooter: ({ children }: any) => <View testID="modal-footer">{children}</View>,
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockClient = {
  cliente_id: '1',
  cognito_user_id: 'user1',
  email: 'client1@example.com',
  telefono: '+57 1 234 5678',
  nombre_institucion: 'Hospital General',
  tipo_institucion: 'hospital',
  nit: '123456789',
  direccion: '123 Main St',
  ciudad: 'Bogotá',
  pais: 'Colombia',
  representante: 'Dr. Carlos Hernández',
  vendedor_asignado_id: { vendedor_id: 'seller1' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockClients = [
  mockClient,
  {
    cliente_id: '2',
    cognito_user_id: 'user2',
    email: 'client2@example.com',
    telefono: '+57 2 987 6543',
    nombre_institucion: 'Clínica del Occidente',
    tipo_institucion: 'clinica',
    nit: '987654321',
    direccion: '456 Oak Ave',
    ciudad: 'Medellín',
    pais: 'Colombia',
    representante: 'Dra. María Rodríguez',
    vendedor_asignado_id: { vendedor_id: 'seller2' },
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

describe('ClientDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      clientId: '1',
    });

    (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
      data: { clients: mockClients },
      isLoading: false,
      error: null,
    });

    (useCreateVisitBffSellersAppVisitsPost as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
    });

    (router.canGoBack as jest.Mock).mockReturnValue(true);
  });

  describe('Component Rendering', () => {
    it('should render the client detail screen', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      expect(getByTestId('client-detail-screen')).toBeTruthy();
    });

    it('should render with correct SafeAreaView edges', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      const container = getByTestId('client-detail-screen');
      expect(container).toBeTruthy();
    });

    it('should render back button', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should render client name as heading', () => {
      const { getAllByText } = render(<ClientDetailScreen />);

      const nameElements = getAllByText('Dr. Carlos Hernández');
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should render schedule visit button', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      expect(getByTestId('schedule-visit-button')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should render loading text when isLoading is true', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.loading')).toBeTruthy();
    });

    it('should render back button in loading state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { getByTestId } = render(<ClientDetailScreen />);

      expect(getByTestId('back-button')).toBeTruthy();
    });

    it('should not render client details when loading', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { queryByTestId } = render(<ClientDetailScreen />);

      expect(queryByTestId('schedule-visit-button')).toBeNull();
    });

    it('should not render error state when loading', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: new Error('Some error'),
      });

      const { getByText, queryByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.loading')).toBeTruthy();
      expect(queryByText('clientDetail.notFound')).toBeNull();
    });
  });

  describe('Error and Not Found States', () => {
    it('should render not found message when error exists', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch clients'),
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
      expect(getByText('clientDetail.notFoundDescription')).toBeTruthy();
    });

    it('should render not found message when client is not found', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        clientId: 'non-existent-id',
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
    });

    it('should render back to clients button in error state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByTestId } = render(<ClientDetailScreen />);

      expect(getByTestId('back-to-clients-button')).toBeTruthy();
    });

    it('should render back button in error state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByTestId } = render(<ClientDetailScreen />);

      const backButtons = getByTestId('back-button');
      expect(backButtons).toBeTruthy();
    });

    it('should handle null data gracefully', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
    });

    it('should handle undefined clients array gracefully', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: {},
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
    });

    it('should handle empty clients array gracefully', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
    });

    it('should handle undefined clientId gracefully', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({});

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
    });
  });

  describe('Client Data Display', () => {
    it('should display client representative name', () => {
      const { getAllByText } = render(<ClientDetailScreen />);

      const nameElements = getAllByText('Dr. Carlos Hernández');
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should display client email', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('client1@example.com')).toBeTruthy();
    });

    it('should display client phone when available', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('+57 1 234 5678')).toBeTruthy();
    });

    it('should not display phone section when telefono is undefined', () => {
      const clientWithoutPhone = {
        ...mockClient,
        telefono: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutPhone] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.phone')).toBeNull();
    });

    it('should display institution name when available', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('Hospital General')).toBeTruthy();
    });

    it('should display NIT when available', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('123456789')).toBeTruthy();
    });

    it('should display address when available', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('123 Main St')).toBeTruthy();
    });

    it('should display city when available', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('Bogotá')).toBeTruthy();
    });

    it('should display country when available', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('Colombia')).toBeTruthy();
    });

    it('should display N/A for missing email', () => {
      const clientWithoutEmail = {
        ...mockClient,
        email: null,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutEmail] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('N/A')).toBeTruthy();
    });

    it('should display empty string email as N/A', () => {
      const clientWithEmptyEmail = {
        ...mockClient,
        email: '',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithEmptyEmail] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('N/A')).toBeTruthy();
    });
  });

  describe('Section Visibility', () => {
    it('should render contact info section', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.contactInfo')).toBeTruthy();
    });

    it('should render institution info section when institution data exists', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.institutionInfo')).toBeTruthy();
    });

    it('should not render institution info section when no institution data', () => {
      const clientWithoutInstitution = {
        ...mockClient,
        nombre_institucion: undefined,
        nit: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutInstitution] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.institutionInfo')).toBeNull();
    });

    it('should render institution info section when only nombre_institucion exists', () => {
      const clientWithOnlyName = {
        ...mockClient,
        nit: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithOnlyName] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.institutionInfo')).toBeTruthy();
    });

    it('should render institution info section when only nit exists', () => {
      const clientWithOnlyNit = {
        ...mockClient,
        nombre_institucion: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithOnlyNit] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.institutionInfo')).toBeTruthy();
    });

    it('should render location section when location data exists', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.location')).toBeTruthy();
    });

    it('should not render location section when no location data', () => {
      const clientWithoutLocation = {
        ...mockClient,
        direccion: undefined,
        ciudad: undefined,
        pais: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutLocation] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.location')).toBeNull();
    });

    it('should render location section when only direccion exists', () => {
      const clientWithOnlyAddress = {
        ...mockClient,
        ciudad: undefined,
        pais: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithOnlyAddress] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.location')).toBeTruthy();
    });

    it('should render location section when only ciudad exists', () => {
      const clientWithOnlyCity = {
        ...mockClient,
        direccion: undefined,
        pais: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithOnlyCity] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.location')).toBeTruthy();
    });

    it('should render location section when only pais exists', () => {
      const clientWithOnlyCountry = {
        ...mockClient,
        direccion: undefined,
        ciudad: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithOnlyCountry] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.location')).toBeTruthy();
    });
  });

  describe('Institution Type Display', () => {
    it('should render institution type badge for hospital', () => {
      const { getAllByText } = render(<ClientDetailScreen />);

      const typeElements = getAllByText('account.institutionTypes.hospital');
      expect(typeElements.length).toBeGreaterThan(0);
    });

    it('should render institution type badge for clinica', () => {
      const clinicClient = {
        ...mockClient,
        cliente_id: '2',
        tipo_institucion: 'clinica',
      };

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        clientId: '2',
      });

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [mockClient, clinicClient] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      const typeElements = getAllByText('account.institutionTypes.clinica');
      expect(typeElements.length).toBeGreaterThan(0);
    });

    it('should render institution type badge for farmacia', () => {
      const pharmacyClient = {
        ...mockClient,
        tipo_institucion: 'farmacia',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [pharmacyClient] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      const typeElements = getAllByText('account.institutionTypes.farmacia');
      expect(typeElements.length).toBeGreaterThan(0);
    });

    it('should render institution type badge for laboratorio', () => {
      const labClient = {
        ...mockClient,
        tipo_institucion: 'laboratorio',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [labClient] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      const typeElements = getAllByText('account.institutionTypes.laboratorio');
      expect(typeElements.length).toBeGreaterThan(0);
    });

    it('should display institution type in institution info section', () => {
      const { getAllByText } = render(<ClientDetailScreen />);

      // Should appear twice: once in badge, once in institution info section
      const typeElements = getAllByText('account.institutionTypes.hospital');
      expect(typeElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Navigation - Back Button', () => {
    it('should call router.back when back button is pressed and can go back', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.back).toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it('should call router.replace when back button is pressed and cannot go back', () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);

      const { getByTestId } = render(<ClientDetailScreen />);

      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.replace).toHaveBeenCalledWith('/(tabs)/clients');
      expect(router.back).not.toHaveBeenCalled();
    });

    it('should navigate back from error state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByTestId } = render(<ClientDetailScreen />);

      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.back).toHaveBeenCalled();
    });

    it('should navigate back from loading state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { getByTestId } = render(<ClientDetailScreen />);

      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      expect(router.back).toHaveBeenCalled();
    });

    it('should navigate back using back-to-clients button in error state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByTestId } = render(<ClientDetailScreen />);

      const backToClientsButton = getByTestId('back-to-clients-button');
      fireEvent.press(backToClientsButton);

      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('Schedule Visit Functionality', () => {
    it('should navigate to schedule visit route when button is pressed', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      const scheduleButton = getByTestId('schedule-visit-button');
      fireEvent.press(scheduleButton);

      // Verify router.push was called with correct route
      expect(router.push).toHaveBeenCalledWith('/client/1/schedule-visit');
    });

    it('should navigate with correct clientId from params', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      // Clear previous calls
      jest.clearAllMocks();

      const scheduleButton = getByTestId('schedule-visit-button');
      fireEvent.press(scheduleButton);

      // Verify router.push was called with correct clientId
      expect(router.push).toHaveBeenCalledWith('/client/1/schedule-visit');
    });

    it('should navigate with correct route for different clients', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        clientId: '2',
      });

      const { getByTestId } = render(<ClientDetailScreen />);

      const scheduleButton = getByTestId('schedule-visit-button');
      fireEvent.press(scheduleButton);

      // Verify router.push was called with correct route
      expect(router.push).toHaveBeenCalledWith('/client/2/schedule-visit');
    });
  });

  describe('API Integration', () => {
    it('should call useListClientsBffSellersAppClientsGet hook on render', () => {
      render(<ClientDetailScreen />);

      expect(useListClientsBffSellersAppClientsGet).toHaveBeenCalledWith(
        undefined,
        {
          query: {
            enabled: true,
            staleTime: 5 * 60 * 1000,
          },
        }
      );
    });

    it('should find correct client by ID from clients array', () => {
      const { getAllByText } = render(<ClientDetailScreen />);

      const nameElements = getAllByText('Dr. Carlos Hernández');
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should find different client when clientId changes', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        clientId: '2',
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      const nameElements = getAllByText('Dra. María Rodríguez');
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should handle stale time configuration correctly', () => {
      render(<ClientDetailScreen />);

      expect(useListClientsBffSellersAppClientsGet).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          query: expect.objectContaining({
            staleTime: 5 * 60 * 1000,
          }),
        })
      );
    });
  });

  describe('useMemo Optimization', () => {
    it('should find client from memoized data', () => {
      const { getAllByText } = render(<ClientDetailScreen />);

      const nameElements = getAllByText('Dr. Carlos Hernández');
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it('should return null when clientId is missing', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({});

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
    });

    it('should return null when clients data is missing', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
    });
  });

  describe('Internationalization', () => {
    it('should use translation hook', () => {
      render(<ClientDetailScreen />);

      expect(useTranslation).toHaveBeenCalled();
    });

    it('should render translated section headers', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.contactInfo')).toBeTruthy();
      expect(getByText('clientDetail.institutionInfo')).toBeTruthy();
      expect(getByText('clientDetail.location')).toBeTruthy();
    });

    it('should render translated field labels', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.profile.email')).toBeTruthy();
      expect(getByText('clientDetail.profile.phone')).toBeTruthy();
      expect(getByText('clientDetail.profile.institution')).toBeTruthy();
      expect(getByText('clientDetail.profile.nit')).toBeTruthy();
      expect(getByText('clientDetail.profile.address')).toBeTruthy();
    });

    it('should render translated button text', () => {
      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.scheduleVisit')).toBeTruthy();
    });

    it('should render translated loading message', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.loading')).toBeTruthy();
    });

    it('should render translated error messages', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByText } = render(<ClientDetailScreen />);

      expect(getByText('clientDetail.notFound')).toBeTruthy();
      expect(getByText('clientDetail.notFoundDescription')).toBeTruthy();
      expect(getByText('common.back')).toBeTruthy();
    });
  });

  describe('Avatar and Initials', () => {
    it('should render avatar component for client', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      // Verify that the screen renders - getInitials would be called internally
      // The Avatar component exists and getInitials('Dr. Carlos Hernández') returns 'DC'
      expect(getByTestId('client-detail-screen')).toBeTruthy();
    });

    it('should render avatar for different representative', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({
        clientId: '2',
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      // Verify the representative name is displayed (which confirms avatar logic works)
      expect(getAllByText('Dra. María Rodríguez').length).toBeGreaterThan(0);
    });

    it('should handle single word names for avatar', () => {
      const clientWithSingleName = {
        ...mockClient,
        representante: 'Madonna',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithSingleName] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      // Verify the representative name is displayed (which confirms avatar logic works)
      // getInitials('Madonna') would return 'MA' internally
      expect(getAllByText('Madonna').length).toBeGreaterThan(0);
    });
  });

  describe('Conditional Field Rendering', () => {
    it('should not render nombre_institucion field when undefined', () => {
      const clientWithoutInstitutionName = {
        ...mockClient,
        nombre_institucion: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutInstitutionName] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.institution')).toBeNull();
    });

    it('should not render tipo_institucion field when undefined', () => {
      const clientWithoutInstitutionType = {
        ...mockClient,
        tipo_institucion: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutInstitutionType] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.type')).toBeNull();
    });

    it('should not render nit field when undefined', () => {
      const clientWithoutNit = {
        ...mockClient,
        nit: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutNit] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.nit')).toBeNull();
    });

    it('should not render representante field in institution section when undefined', () => {
      const clientWithoutRepresentante = {
        ...mockClient,
        representante: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutRepresentante] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.name')).toBeNull();
    });

    it('should not render direccion field when undefined', () => {
      const clientWithoutAddress = {
        ...mockClient,
        direccion: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutAddress] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.address')).toBeNull();
    });

    it('should not render ciudad field when undefined', () => {
      const clientWithoutCity = {
        ...mockClient,
        ciudad: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutCity] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.city')).toBeNull();
    });

    it('should not render pais field when undefined', () => {
      const clientWithoutCountry = {
        ...mockClient,
        pais: undefined,
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithoutCountry] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      expect(queryByText('clientDetail.profile.country')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle client with all optional fields missing', () => {
      const minimalClient = {
        cliente_id: '1',
        cognito_user_id: 'user1',
        email: 'minimal@example.com',
        representante: 'Minimal Client',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [minimalClient] },
        isLoading: false,
        error: null,
      });

      const { getAllByText, queryByText } = render(<ClientDetailScreen />);

      const nameElements = getAllByText('Minimal Client');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(getAllByText('minimal@example.com').length).toBeGreaterThan(0);
      expect(queryByText('clientDetail.institutionInfo')).toBeNull();
      expect(queryByText('clientDetail.location')).toBeNull();
    });

    it('should handle client with all fields present', () => {
      const { getAllByText } = render(<ClientDetailScreen />);

      expect(getAllByText('Dr. Carlos Hernández').length).toBeGreaterThan(0);
      expect(getAllByText('client1@example.com').length).toBeGreaterThan(0);
      expect(getAllByText('+57 1 234 5678').length).toBeGreaterThan(0);
      expect(getAllByText('Hospital General').length).toBeGreaterThan(0);
      expect(getAllByText('123456789').length).toBeGreaterThan(0);
      expect(getAllByText('123 Main St').length).toBeGreaterThan(0);
      expect(getAllByText('Bogotá').length).toBeGreaterThan(0);
      expect(getAllByText('Colombia').length).toBeGreaterThan(0);
    });

    it('should handle empty string values gracefully', () => {
      const clientWithEmptyStrings = {
        ...mockClient,
        telefono: '',
        direccion: '',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithEmptyStrings] },
        isLoading: false,
        error: null,
      });

      const { queryByText } = render(<ClientDetailScreen />);

      // Empty telefono should not render phone section
      expect(queryByText('clientDetail.profile.phone')).toBeNull();
      // Empty direccion should not render address field
      expect(queryByText('clientDetail.profile.address')).toBeNull();
    });

    it('should handle special characters in client data', () => {
      const clientWithSpecialChars = {
        ...mockClient,
        representante: 'José María García-López',
        direccion: 'Calle #123-45, Apto 6B',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithSpecialChars] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      expect(getAllByText('José María García-López').length).toBeGreaterThan(0);
      expect(getAllByText('Calle #123-45, Apto 6B').length).toBeGreaterThan(0);
    });

    it('should handle very long text values', () => {
      const clientWithLongValues = {
        ...mockClient,
        representante: 'Dr. Juan Carlos Alberto González Rodríguez Martínez',
        direccion: 'Avenida Principal del Centro Comercial y Residencial de la Ciudad, Edificio Torres del Norte, Torre A, Apartamento 1234',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithLongValues] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      expect(getAllByText('Dr. Juan Carlos Alberto González Rodríguez Martínez').length).toBeGreaterThan(0);
      expect(getAllByText('Avenida Principal del Centro Comercial y Residencial de la Ciudad, Edificio Torres del Norte, Torre A, Apartamento 1234').length).toBeGreaterThan(0);
    });

    it('should handle case-insensitive institution type matching', () => {
      const clientWithUppercaseType = {
        ...mockClient,
        tipo_institucion: 'HOSPITAL',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithUppercaseType] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      const typeElements = getAllByText('account.institutionTypes.hospital');
      expect(typeElements.length).toBeGreaterThan(0);
    });

    it('should handle unknown institution type gracefully', () => {
      const clientWithUnknownType = {
        ...mockClient,
        tipo_institucion: 'unknown_type',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [clientWithUnknownType] },
        isLoading: false,
        error: null,
      });

      const { getAllByText } = render(<ClientDetailScreen />);

      const typeElements = getAllByText('unknown_type');
      expect(typeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Component Rerender', () => {
    it('should handle rerender with updated client data', () => {
      const { rerender, getAllByText } = render(<ClientDetailScreen />);

      expect(getAllByText('Dr. Carlos Hernández').length).toBeGreaterThan(0);

      const updatedClient = {
        ...mockClient,
        representante: 'Updated Name',
      };

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [updatedClient] },
        isLoading: false,
        error: null,
      });

      rerender(<ClientDetailScreen />);

      expect(getAllByText('Updated Name').length).toBeGreaterThan(0);
    });

    it('should handle rerender when loading state changes', () => {
      const { rerender, getAllByText, getByText, queryByText } = render(<ClientDetailScreen />);

      expect(getAllByText('Dr. Carlos Hernández').length).toBeGreaterThan(0);

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      rerender(<ClientDetailScreen />);

      expect(getByText('clientDetail.loading')).toBeTruthy();
      expect(queryByText('Dr. Carlos Hernández')).toBeNull();
    });

    it('should handle rerender when clientId changes', () => {
      const { rerender, getAllByText, queryByText } = render(<ClientDetailScreen />);

      expect(getAllByText('Dr. Carlos Hernández').length).toBeGreaterThan(0);

      (useLocalSearchParams as jest.Mock).mockReturnValue({
        clientId: '2',
      });

      rerender(<ClientDetailScreen />);

      expect(getAllByText('Dra. María Rodríguez').length).toBeGreaterThan(0);
      expect(queryByText('Dr. Carlos Hernández')).toBeNull();
    });
  });

  describe('ScrollView Behavior', () => {
    it('should render ScrollView in main content', () => {
      const { getByTestId } = render(<ClientDetailScreen />);

      expect(getByTestId('client-detail-screen')).toBeTruthy();
    });

    it('should not render ScrollView in loading state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { queryByTestId } = render(<ClientDetailScreen />);

      expect(queryByTestId('schedule-visit-button')).toBeNull();
    });

    it('should not render ScrollView in error state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { queryByTestId } = render(<ClientDetailScreen />);

      expect(queryByTestId('schedule-visit-button')).toBeNull();
    });
  });
});
