import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { RoleGuard } from './RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';

jest.mock('@/store/useAuthStore');

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user has required role', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { role: 'seller' },
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['seller']}>
        <Text>Seller Content</Text>
      </RoleGuard>
    );

    expect(getByText('Seller Content')).toBeDefined();
  });

  it('should render fallback when user does not have required role', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { role: 'client' },
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['seller']} fallback={<Text>Not Authorized</Text>}>
        <Text>Seller Content</Text>
      </RoleGuard>
    );

    expect(getByText('Not Authorized')).toBeDefined();
  });

  it('should render children when user role matches one of multiple allowed roles', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { role: 'client' },
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['seller', 'client']}>
        <Text>Allowed Content</Text>
      </RoleGuard>
    );

    expect(getByText('Allowed Content')).toBeDefined();
  });

  it('should render fallback when user is null', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: null,
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['seller']} fallback={<Text>Not Logged In</Text>}>
        <Text>Protected Content</Text>
      </RoleGuard>
    );

    expect(getByText('Not Logged In')).toBeDefined();
  });

  it('should render fallback when user role is missing', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { id: '123' },
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['seller']} fallback={<Text>No Role</Text>}>
        <Text>Role Required</Text>
      </RoleGuard>
    );

    expect(getByText('No Role')).toBeDefined();
  });

  it('should default to null fallback when not provided', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { role: 'client' },
      })
    );

    const { queryByText } = render(
      <RoleGuard allowedRoles={['seller']}>
        <Text>Seller Content</Text>
      </RoleGuard>
    );

    expect(queryByText('Seller Content')).toBeFalsy();
  });

  it('should render children for seller role', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { role: 'seller' },
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['seller']}>
        <Text>Seller Dashboard</Text>
      </RoleGuard>
    );

    expect(getByText('Seller Dashboard')).toBeDefined();
  });

  it('should render children for client role', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { role: 'client' },
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['client']}>
        <Text>Client Portal</Text>
      </RoleGuard>
    );

    expect(getByText('Client Portal')).toBeDefined();
  });

  it('should handle complex children structure', () => {
    const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { role: 'seller' },
      })
    );

    const { getByText } = render(
      <RoleGuard allowedRoles={['seller']}>
        <Text>Title</Text>
        <Text>Description</Text>
      </RoleGuard>
    );

    expect(getByText('Title')).toBeDefined();
    expect(getByText('Description')).toBeDefined();
  });
});
