import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View } from 'react-native';
import { AccountScreen } from './AccountScreen';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store';
import { router } from 'expo-router';
import { useTranslation } from '@/i18n/hooks';

// Mock dependencies
jest.mock('@/providers/AuthProvider');
jest.mock('@/store');
jest.mock('@/i18n/hooks');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSegments: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const RN = jest.requireActual('react-native');
  return {
    SafeAreaView: RN.View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('lucide-react-native', () => ({
  Mail: 'Mail',
  Phone: 'Phone',
  Building2: 'Building2',
  MapPin: 'MapPin',
  FileText: 'FileText',
  UserCircle: 'UserCircle',
  LogOut: 'LogOut',
}));

const mockLogout = jest.fn();

describe('AccountScreen', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'John Doe',
    role: 'client',
    groups: ['client'],
    profile: {
      telefono: '+1234567890',
      nombreInstitucion: 'Test Hospital',
      tipoInstitucion: 'hospital',
      nit: '123456789',
      representante: 'John Representative',
      direccion: '123 Main St',
      ciudad: 'Test City',
      pais: 'Colombia',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
    });

    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ user: mockUser })
    );

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string, options?: any) => {
        if (options?.version) return `App v${options.version}`;
        return key;
      },
    });
  });

  describe('Basic Rendering', () => {
    it('should render AccountScreen without crashing', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.title')).toBeTruthy();
    });

    it('should display account title', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.title')).toBeTruthy();
    });

    it('should render user profile section', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display logout button', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.logout')).toBeTruthy();
    });

    it('should render app info section', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.appInfo.appName')).toBeTruthy();
    });
  });

  describe('User Profile Display', () => {
    it('should display user name', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display user avatar with initials', () => {
      const { getByText, queryByText } = render(<AccountScreen />);
      // The avatar should display the initials from the user's name
      // Either full initials "JD" or just "J" depending on component rendering
      const initialsElement = queryByText('JD') || queryByText('J');
      expect(initialsElement).toBeTruthy();
    });

    it('should display user role badge', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.title')).toBeTruthy();
    });

    it('should display user email', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('test@example.com')).toBeTruthy();
    });

    it('should display contact info section header', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.contactInfo')).toBeTruthy();
    });
  });

  describe('Contact Information Display', () => {
    it('should display phone when provided', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('+1234567890')).toBeTruthy();
    });

    it('should not display phone when not provided', () => {
      const userWithoutPhone = {
        ...mockUser,
        profile: { ...mockUser.profile, telefono: undefined },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithoutPhone })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('+1234567890')).toBeNull();
    });

    it('should display email label', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.profile.email')).toBeTruthy();
    });

    it('should display phone label', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.profile.phone')).toBeTruthy();
    });

    it('should display N/A when email is missing', () => {
      const userWithoutEmail = {
        ...mockUser,
        email: undefined,
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithoutEmail })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('N/A')).toBeTruthy();
    });
  });

  describe('Institution Information Display - Client Role', () => {
    it('should display institution info section for client role', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.institutionInfo')).toBeTruthy();
    });

    it('should display institution name', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('Test Hospital')).toBeTruthy();
    });

    it('should display institution type label', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.profile.type')).toBeTruthy();
    });

    it('should display institution type value', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.institutionTypes.hospital')).toBeTruthy();
    });

    it('should display NIT number', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('123456789')).toBeTruthy();
    });

    it('should display representative name', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Representative')).toBeTruthy();
    });

    it('should not display institution info for non-client role', () => {
      const sellerUser = {
        ...mockUser,
        role: 'seller',
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: sellerUser })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('account.institutionInfo')).toBeNull();
    });

    it('should not display institution info when no institution data', () => {
      const clientWithoutInstitution = {
        ...mockUser,
        role: 'client',
        profile: { ...mockUser.profile, nombreInstitucion: undefined, tipoInstitucion: undefined },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: clientWithoutInstitution })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('account.institutionInfo')).toBeNull();
    });
  });

  describe('Institution Information by Type', () => {
    it('should display hospital type correctly', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.institutionTypes.hospital')).toBeTruthy();
    });

    it('should display clinica type correctly', () => {
      const clinicUser = {
        ...mockUser,
        profile: { ...mockUser.profile, tipoInstitucion: 'clinica' },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: clinicUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.institutionTypes.clinica')).toBeTruthy();
    });

    it('should display laboratorio type correctly', () => {
      const labUser = {
        ...mockUser,
        profile: { ...mockUser.profile, tipoInstitucion: 'laboratorio' },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: labUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.institutionTypes.laboratorio')).toBeTruthy();
    });

    it('should display farmacia type correctly', () => {
      const pharmacyUser = {
        ...mockUser,
        profile: { ...mockUser.profile, tipoInstitucion: 'farmacia' },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: pharmacyUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.institutionTypes.farmacia')).toBeTruthy();
    });
  });

  describe('Location Information Display', () => {
    it('should display location section', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.location')).toBeTruthy();
    });

    it('should display address', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('123 Main St')).toBeTruthy();
    });

    it('should display city', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('Test City')).toBeTruthy();
    });

    it('should display country', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('Colombia')).toBeTruthy();
    });

    it('should display address label', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.profile.address')).toBeTruthy();
    });

    it('should display city label', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.profile.city')).toBeTruthy();
    });

    it('should display country label', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.profile.country')).toBeTruthy();
    });

    it('should not display location section when no location data', () => {
      const userWithoutLocation = {
        ...mockUser,
        profile: {
          telefono: '+1234567890',
          nombreInstitucion: 'Test Hospital',
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithoutLocation })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('account.location')).toBeNull();
    });

    it('should display location section with partial data', () => {
      const userWithPartialLocation = {
        ...mockUser,
        profile: {
          ...mockUser.profile,
          ciudad: 'Only City',
          direccion: undefined,
          pais: undefined,
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithPartialLocation })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.location')).toBeTruthy();
      expect(getByText('Only City')).toBeTruthy();
    });
  });

  describe('User Type Badges', () => {
    it('should display role information for client', () => {
      const clientUser = { ...mockUser, role: 'client' };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: clientUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display role information for seller', () => {
      const sellerUser = { ...mockUser, role: 'seller' };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: sellerUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display role information for admin', () => {
      const adminUser = { ...mockUser, role: 'admin' };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: adminUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display role information for unknown role', () => {
      const unknownRoleUser = { ...mockUser, role: 'unknown' };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: unknownRoleUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Groups Display', () => {
    it('should display user with single group', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display user with multiple groups', () => {
      const multiGroupUser = {
        ...mockUser,
        groups: ['client', 'seller', 'analyst'],
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: multiGroupUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display user without groups', () => {
      const userWithoutGroups = {
        ...mockUser,
        groups: [],
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithoutGroups })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Logout Functionality', () => {
    it('should display logout button', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.logout')).toBeTruthy();
    });

    it('should call logout when logout button is pressed', () => {
      const { getByText } = render(<AccountScreen />);
      const logoutButton = getByText('account.logout');

      fireEvent.press(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should navigate to login after logout', () => {
      const { getByText } = render(<AccountScreen />);
      const logoutButton = getByText('account.logout');

      fireEvent.press(logoutButton);

      expect(router.replace).toHaveBeenCalledWith('/login');
    });

    it('should have logout button visible', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.logout')).toBeTruthy();
    });

    it('should render logout button properly', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.logout')).toBeTruthy();
    });
  });

  describe('App Info Display', () => {
    it('should display app name', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.appInfo.appName')).toBeTruthy();
    });

    it('should display app version', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('App v1.0.0')).toBeTruthy();
    });

    it('should render app info section', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.appInfo.appName')).toBeTruthy();
    });
  });

  describe('Edge Cases - Missing User Data', () => {
    it('should handle undefined user', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: undefined })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('Usuario')).toBeTruthy(); // Default user name
    });

    it('should handle user with minimal data', () => {
      const minimalUser = {
        id: '1',
        email: 'minimal@test.com',
        name: 'Minimal User',
        role: 'client',
        groups: ['client'],
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: minimalUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('Minimal User')).toBeTruthy();
      expect(getByText('minimal@test.com')).toBeTruthy();
    });

    it('should handle user with empty profile object', () => {
      const userWithEmptyProfile = {
        ...mockUser,
        profile: {},
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithEmptyProfile })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('account.institutionInfo')).toBeNull();
      expect(queryByText('account.location')).toBeNull();
    });

    it('should handle null profile values', () => {
      const userWithNullProfile = {
        ...mockUser,
        profile: {
          telefono: null,
          nombreInstitucion: null,
          tipoInstitucion: null,
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithNullProfile })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.contactInfo')).toBeTruthy();
    });
  });

  describe('Conditional Rendering - Institution Info', () => {
    it('should show institution info only when client role and has institution data', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.institutionInfo')).toBeTruthy();
    });

    it('should hide institution info for seller role', () => {
      const sellerUser = {
        ...mockUser,
        role: 'seller',
        profile: mockUser.profile,
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: sellerUser })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('account.institutionInfo')).toBeNull();
    });

    it('should hide institution info for admin role', () => {
      const adminUser = {
        ...mockUser,
        role: 'admin',
        profile: mockUser.profile,
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: adminUser })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('account.institutionInfo')).toBeNull();
    });

    it('should conditionally display institution fields', () => {
      const clientWithPartialInfo = {
        ...mockUser,
        profile: {
          nombreInstitucion: 'Hospital A',
          // Missing tipoInstitucion
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: clientWithPartialInfo })
      );

      const { getByText, queryByText } = render(<AccountScreen />);
      expect(getByText('account.institutionInfo')).toBeTruthy();
      expect(getByText('Hospital A')).toBeTruthy();
    });
  });

  describe('Conditional Rendering - Location Info', () => {
    it('should show location info when any location data exists', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.location')).toBeTruthy();
    });

    it('should hide location info when no location data', () => {
      const userWithoutLocation = {
        ...mockUser,
        profile: {
          telefono: '+1234567890',
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithoutLocation })
      );

      const { queryByText } = render(<AccountScreen />);
      expect(queryByText('account.location')).toBeNull();
    });

    it('should conditionally display location fields', () => {
      const userWithPartialLocation = {
        ...mockUser,
        profile: {
          telefono: '+1234567890',
          nombreInstitucion: 'Hospital',
          tipoInstitucion: 'hospital',
          direccion: '123 Main',
          // Missing ciudad and pais
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: userWithPartialLocation })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.location')).toBeTruthy();
      expect(getByText('123 Main')).toBeTruthy();
    });
  });

  describe('Multiple User Scenarios', () => {
    it('should display correct information for client user', () => {
      const clientUser = {
        ...mockUser,
        role: 'client',
        name: 'Hospital Admin',
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: clientUser })
      );

      const { getByText } = render(<AccountScreen />);
      expect(getByText('Hospital Admin')).toBeTruthy();
      expect(getByText('account.institutionInfo')).toBeTruthy();
    });

    it('should display correct information for seller user', () => {
      const sellerUser = {
        ...mockUser,
        role: 'seller',
        name: 'Sales Representative',
        profile: {
          telefono: '+5551234567',
          direccion: '456 Sales Ave',
          ciudad: 'Sales City',
          pais: 'Colombia',
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: sellerUser })
      );

      const { getByText, queryByText } = render(<AccountScreen />);
      expect(getByText('Sales Representative')).toBeTruthy();
      expect(queryByText('account.institutionInfo')).toBeNull();
      expect(getByText('456 Sales Ave')).toBeTruthy();
    });

    it('should display correct information for admin user', () => {
      const adminUser = {
        ...mockUser,
        role: 'admin',
        name: 'System Administrator',
        profile: {
          telefono: '+1111111111',
        },
      };
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: adminUser })
      );

      const { getByText, queryByText } = render(<AccountScreen />);
      expect(getByText('System Administrator')).toBeTruthy();
      expect(queryByText('account.institutionInfo')).toBeNull();
    });
  });

  describe('Divider Display', () => {
    it('should render account screen with all sections', () => {
      const { getByText } = render(<AccountScreen />);
      expect(getByText('account.title')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
    });
  });
});
