import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AccountScreen } from './AccountScreen';
import { useAuthStore } from '@/store';
import { useAuth } from '@/providers';
import { useTranslation } from '@/i18n/hooks';
import { getInitials } from '@/utils/getInitials';
import { getUserTypeBadge } from '@/utils/getUserTypeBadge';
import { getInstitutionTypeLabel } from '@/utils/getInstitutionTypeLabel';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('@/store');
jest.mock('@/providers');
jest.mock('@/i18n/hooks');
jest.mock('@/utils/getInitials');
jest.mock('@/utils/getUserTypeBadge');
jest.mock('@/utils/getInstitutionTypeLabel');
jest.mock('expo-router');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockGetInitials = getInitials as jest.MockedFunction<typeof getInitials>;
const mockGetUserTypeBadge = getUserTypeBadge as jest.MockedFunction<typeof getUserTypeBadge>;
const mockGetInstitutionTypeLabel = getInstitutionTypeLabel as jest.MockedFunction<
  typeof getInstitutionTypeLabel
>;

describe('AccountScreen', () => {
  const mockLogout = jest.fn();

  const mockT = (key: string, params?: any): string => {
    const translations: Record<string, string> = {
      'account.title': 'Account',
      'account.contactInfo': 'Contact Information',
      'account.profile.email': 'Email',
      'account.profile.phone': 'Phone',
      'account.institutionInfo': 'Institution Information',
      'account.profile.institution': 'Institution',
      'account.profile.type': 'Type',
      'account.profile.nit': 'NIT',
      'account.profile.representative': 'Representative',
      'account.location': 'Location',
      'account.profile.address': 'Address',
      'account.profile.city': 'City',
      'account.profile.country': 'Country',
      'account.logout': 'Logout',
      'account.appInfo.appName': 'MediSupply',
      'account.appInfo.version': `Version ${params?.version || '1.0.0'}`,
    };
    return translations[key] || key;
  };

  const setupUserMock = (user: any) => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { user } as any;
      return selector(state);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      logout: mockLogout,
    } as any);

    mockUseTranslation.mockReturnValue({
      t: mockT,
    } as any);

    mockGetInitials.mockImplementation((name) => {
      if (!name) return '';
      const parts = name.split(' ');
      return parts.map((p) => p[0]).join('').toUpperCase();
    });

    mockGetUserTypeBadge.mockReturnValue({
      label: 'Client',
      action: 'success',
    });

    mockGetInstitutionTypeLabel.mockReturnValue('Hospital');

    setupUserMock(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Screen renders with testID
  it('should render screen with testID', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    expect(screen.getByTestId('account-screen')).toBeTruthy();
  });

  // Test 2: User name when available
  it('should render user name when available', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    expect(screen.getByText('Alice Smith')).toBeTruthy();
  });

  // Test 3: Default user name when null
  it('should render default name "Usuario" when user name is null', () => {
    setupUserMock({
      id: '1',
      name: null,
      email: 'john@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    expect(screen.getByText('Usuario')).toBeTruthy();
  });

  // Test 4: Avatar with initials
  it('should render avatar with initials from user name', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    expect(mockGetInitials).toHaveBeenCalledWith('Alice Smith');
  });

  // Test 5: User type badge
  it('should render user type badge for role', () => {
    mockGetUserTypeBadge.mockReturnValue({
      label: 'Seller',
      action: 'info',
    });

    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'seller',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    expect(mockGetUserTypeBadge).toHaveBeenCalledWith('seller', mockT);
    expect(screen.getByText('Seller')).toBeTruthy();
  });

  // Test 6: Groups - empty array not shown
  it('should not render groups when user has none or single group', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    const { queryByText } = render(<AccountScreen />);
    expect(queryByText('admin')).toBeFalsy();
  });

  // Test 7: Groups - single group not shown
  it('should not show single group, only multiple groups display', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: ['admin'],
      profile: {},
    });

    const { queryByText } = render(<AccountScreen />);
    expect(queryByText('admin')).toBeFalsy();
  });

  // Test 8: Multiple groups rendered
  it('should render multiple groups when user has more than one', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: ['admin', 'staff'],
      profile: {},
    });

    render(<AccountScreen />);
    expect(screen.getByText('admin')).toBeTruthy();
    expect(screen.getByText('staff')).toBeTruthy();
  });

  // Test 9: Email in contact info
  it('should render email in contact info section', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    expect(screen.getByTestId('contact-info')).toBeTruthy();
    expect(screen.getByText('alice@example.com')).toBeTruthy();
  });

  // Test 10: Default email when null
  it('should render N/A as default email when null', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: null,
      role: 'client',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    expect(screen.getByText('N/A')).toBeTruthy();
  });

  // Test 11: Phone when available
  it('should render phone when available in profile', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {
        telefono: '3115551234',
      },
    });

    render(<AccountScreen />);
    expect(screen.getByText('3115551234')).toBeTruthy();
  });

  // Test 12: Phone not shown when unavailable
  it('should not render phone when unavailable in profile', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    const { queryByText } = render(<AccountScreen />);
    expect(queryByText('3115551234')).toBeFalsy();
  });

  // Test 13: Institution NOT shown for non-client
  it('should not render institution section for non-client users', () => {
    setupUserMock({
      id: '1',
      name: 'Bob Jones',
      email: 'bob@example.com',
      role: 'seller',
      groups: [],
      profile: {
        nombreInstitucion: 'Seller Hospital',
      },
    });

    const { queryByTestId } = render(<AccountScreen />);
    expect(queryByTestId('institution-info')).toBeFalsy();
  });

  // Test 14: Institution NOT shown without data
  it('should not render institution section without institution data', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    const { queryByTestId } = render(<AccountScreen />);
    expect(queryByTestId('institution-info')).toBeFalsy();
  });

  // Test 15: Institution shown for client with all fields
  it('should render institution section with all fields for client', () => {
    mockGetInstitutionTypeLabel.mockReturnValue('Clinic');

    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {
        nombreInstitucion: 'Central Clinic',
        tipoInstitucion: 'clinic',
        nit: '987654321',
        representante: 'Dr. Miguel Lopez',
      },
    });

    render(<AccountScreen />);
    expect(screen.getByTestId('institution-info')).toBeTruthy();
    expect(screen.getByText('Central Clinic')).toBeTruthy();
    expect(mockGetInstitutionTypeLabel).toHaveBeenCalledWith('clinic', mockT);
    expect(screen.getByText('Clinic')).toBeTruthy();
    expect(screen.getByText('987654321')).toBeTruthy();
    expect(screen.getByText('Dr. Miguel Lopez')).toBeTruthy();
  });

  // Test 16: Location NOT shown without data
  it('should not render location section without location data', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    const { queryByTestId } = render(<AccountScreen />);
    expect(queryByTestId('location-info')).toBeFalsy();
  });

  // Test 17: Location shown with all fields
  it('should render location section with all fields when available', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {
        direccion: '456 Oak Ave',
        ciudad: 'Medellin',
        pais: 'Colombia',
      },
    });

    render(<AccountScreen />);
    expect(screen.getByTestId('location-info')).toBeTruthy();
    expect(screen.getByText('456 Oak Ave')).toBeTruthy();
    expect(screen.getByText('Medellin')).toBeTruthy();
    expect(screen.getByText('Colombia')).toBeTruthy();
  });

  // Test 18: Logout button calls handler and navigates
  it('should call logout and navigate when logout button is pressed', () => {
    setupUserMock({
      id: '1',
      name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'client',
      groups: [],
      profile: {},
    });

    render(<AccountScreen />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.press(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  // Test 19: Full client profile with all sections
  it('should render complete client profile with all sections and data', () => {
    mockGetInstitutionTypeLabel.mockReturnValue('Hospital');
    mockGetUserTypeBadge.mockReturnValue({
      label: 'Client',
      action: 'success',
    });

    setupUserMock({
      id: '1',
      name: 'Carlos Rodriguez',
      email: 'carlos@example.com',
      role: 'client',
      groups: ['doctors', 'administrators'],
      profile: {
        telefono: '3125551234',
        nombreInstitucion: 'National Hospital',
        tipoInstitucion: 'hospital',
        nit: '123456789',
        representante: 'Dr. Elena Gomez',
        direccion: '789 Medical Blvd',
        ciudad: 'Bogota',
        pais: 'Colombia',
      },
    });

    render(<AccountScreen />);

    // Verify all sections exist
    expect(screen.getByTestId('account-screen')).toBeTruthy();
    expect(screen.getByTestId('contact-info')).toBeTruthy();
    expect(screen.getByTestId('institution-info')).toBeTruthy();
    expect(screen.getByTestId('location-info')).toBeTruthy();

    // Verify all data displays
    expect(screen.getByText('Carlos Rodriguez')).toBeTruthy();
    expect(screen.getByText('carlos@example.com')).toBeTruthy();
    expect(screen.getByText('3125551234')).toBeTruthy();
    expect(screen.getByText('National Hospital')).toBeTruthy();
    expect(screen.getByText('123456789')).toBeTruthy();
    expect(screen.getByText('Dr. Elena Gomez')).toBeTruthy();
    expect(screen.getByText('789 Medical Blvd')).toBeTruthy();
    expect(screen.getByText('Bogota')).toBeTruthy();
    expect(screen.getByText('Colombia')).toBeTruthy();
    expect(screen.getByText('doctors')).toBeTruthy();
    expect(screen.getByText('administrators')).toBeTruthy();
  });

  // Test 20: Minimal seller profile without institution/location
  it('should render minimal seller profile without institution and location sections', () => {
    mockGetUserTypeBadge.mockReturnValue({
      label: 'Seller',
      action: 'info',
    });

    setupUserMock({
      id: '2',
      name: 'Maria Vendor',
      email: 'maria@example.com',
      role: 'seller',
      groups: [],
      profile: {},
    });

    const { queryByTestId } = render(<AccountScreen />);

    expect(screen.getByTestId('account-screen')).toBeTruthy();
    expect(screen.getByText('Maria Vendor')).toBeTruthy();
    expect(screen.getByText('maria@example.com')).toBeTruthy();
    expect(screen.getByText('Seller')).toBeTruthy();
    expect(queryByTestId('institution-info')).toBeFalsy();
    expect(queryByTestId('location-info')).toBeFalsy();
  });
});
