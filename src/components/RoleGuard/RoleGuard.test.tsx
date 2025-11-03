import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { RoleGuard } from './RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';

// Mock useAuthStore
jest.mock('@/store/useAuthStore');

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case 1: Renders children when user has allowed role
  describe('Renders children when user has allowed role', () => {
    it('should render children when seller user has seller role', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '1', email: 'seller@example.com', name: 'Seller User', role: 'seller' } })
      );

      const { getByText } = render(
        <RoleGuard allowedRoles={['seller']}>
          <Text>Seller Content</Text>
        </RoleGuard>
      );

      expect(getByText('Seller Content')).toBeTruthy();
    });

    it('should render children when client user has client role', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '2', email: 'client@example.com', name: 'Client User', role: 'client' } })
      );

      const { getByText } = render(
        <RoleGuard allowedRoles={['client']}>
          <Text>Client Content</Text>
        </RoleGuard>
      );

      expect(getByText('Client Content')).toBeTruthy();
    });

    it('should render children when seller user accesses content with multiple allowed roles', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '1', email: 'seller@example.com', name: 'Seller User', role: 'seller' } })
      );

      const { getByTestId } = render(
        <RoleGuard allowedRoles={['seller', 'client']}>
          <Text testID="both-roles-content">Content for Both Roles</Text>
        </RoleGuard>
      );

      expect(getByTestId('both-roles-content')).toBeTruthy();
    });

    it('should render children when client user accesses content with multiple allowed roles', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '2', email: 'client@example.com', name: 'Client User', role: 'client' } })
      );

      const { getByTestId } = render(
        <RoleGuard allowedRoles={['seller', 'client']}>
          <Text testID="both-roles-content">Content for Both Roles</Text>
        </RoleGuard>
      );

      expect(getByTestId('both-roles-content')).toBeTruthy();
    });
  });

  // Test case 2: Does not render children when user lacks role
  describe('Does not render children when user lacks role', () => {
    it('should not render children when seller user tries to access client-only content', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '1', email: 'seller@example.com', name: 'Seller User', role: 'seller' } })
      );

      const { queryByText } = render(
        <RoleGuard allowedRoles={['client']}>
          <Text>Client Only Content</Text>
        </RoleGuard>
      );

      expect(queryByText('Client Only Content')).toBeNull();
    });

    it('should not render children when client user tries to access seller-only content', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '2', email: 'client@example.com', name: 'Client User', role: 'client' } })
      );

      const { queryByText } = render(
        <RoleGuard allowedRoles={['seller']}>
          <Text>Seller Only Content</Text>
        </RoleGuard>
      );

      expect(queryByText('Seller Only Content')).toBeNull();
    });
  });

  // Test case 3: Handles no user (not authenticated)
  describe('Handles no user (not authenticated)', () => {
    it('should return null when no user and no fallback provided', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { queryByText } = render(
        <RoleGuard allowedRoles={['seller']}>
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      // When no user and no fallback, should render empty fragment
      expect(queryByText('Protected Content')).toBeNull();
    });

    it('should render fallback when no user and fallback is provided', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: null })
      );

      const { getByText } = render(
        <RoleGuard allowedRoles={['seller']} fallback={<Text>Access Denied</Text>}>
          <Text>Protected Content</Text>
        </RoleGuard>
      );

      expect(getByText('Access Denied')).toBeTruthy();
    });
  });

  // Test case 4: Handles missing role on user
  describe('Handles missing role on user', () => {
    it('should not render children when user exists but has no role property', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '3', email: 'noRole@example.com', name: 'User with No Role' } })
      );

      const { queryByText } = render(
        <RoleGuard allowedRoles={['seller', 'client']}>
          <Text>Content Requiring Role</Text>
        </RoleGuard>
      );

      expect(queryByText('Content Requiring Role')).toBeNull();
    });

    it('should render fallback when user exists but has no role and fallback is provided', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '3', email: 'noRole@example.com', name: 'User with No Role' } })
      );

      const { getByText } = render(
        <RoleGuard allowedRoles={['seller']} fallback={<Text>Fallback Message</Text>}>
          <Text>Content Requiring Role</Text>
        </RoleGuard>
      );

      expect(getByText('Fallback Message')).toBeTruthy();
    });
  });

  // Test case 5: Renders fallback when access denied
  describe('Renders fallback when access denied', () => {
    it('should render fallback component instead of children when access is denied', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '1', email: 'seller@example.com', name: 'Seller User', role: 'seller' } })
      );

      const fallbackContent = (
        <View>
          <Text>Access Denied - Client Only</Text>
        </View>
      );

      const { getByText, queryByText } = render(
        <RoleGuard allowedRoles={['client']} fallback={fallbackContent}>
          <Text>Client Only Content</Text>
        </RoleGuard>
      );

      expect(getByText('Access Denied - Client Only')).toBeTruthy();
      expect(queryByText('Client Only Content')).toBeNull();
    });

    it('should show fallback with complex component structure', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '2', email: 'client@example.com', name: 'Client User', role: 'client' } })
      );

      const fallbackContent = (
        <View>
          <Text testID="fallback-title">Unauthorized Access</Text>
          <Text testID="fallback-message">You do not have permission to view this content</Text>
        </View>
      );

      const { getByTestId, queryByText } = render(
        <RoleGuard allowedRoles={['seller']} fallback={fallbackContent}>
          <Text>Seller Only Content</Text>
        </RoleGuard>
      );

      expect(getByTestId('fallback-title')).toBeTruthy();
      expect(getByTestId('fallback-message')).toBeTruthy();
      expect(queryByText('Seller Only Content')).toBeNull();
    });
  });

  // Additional edge case tests
  describe('Edge cases', () => {
    it('should handle empty allowedRoles array', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '1', email: 'seller@example.com', name: 'Seller User', role: 'seller' } })
      );

      const { queryByText } = render(
        <RoleGuard allowedRoles={[]}>
          <Text>Content</Text>
        </RoleGuard>
      );

      expect(queryByText('Content')).toBeNull();
    });

    it('should correctly call useAuthStore with selector function', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '1', email: 'seller@example.com', name: 'Seller User', role: 'seller' } })
      );

      render(
        <RoleGuard allowedRoles={['seller']}>
          <Text>Content</Text>
        </RoleGuard>
      );

      expect(useAuthStore).toHaveBeenCalled();
    });

    it('should render children when role is exactly matched in allowed roles list', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '1', email: 'seller@example.com', name: 'Seller User', role: 'seller' } })
      );

      const { getByText } = render(
        <RoleGuard allowedRoles={['seller']}>
          <Text>Exact Match Content</Text>
        </RoleGuard>
      );

      expect(getByText('Exact Match Content')).toBeTruthy();
    });

    it('should not render children when role is not in allowed roles list', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '2', email: 'admin@example.com', name: 'Admin User', role: 'admin' } })
      );

      const { queryByText } = render(
        <RoleGuard allowedRoles={['seller', 'client']}>
          <Text>Admin Only Content</Text>
        </RoleGuard>
      );

      expect(queryByText('Admin Only Content')).toBeNull();
    });

    it('should render fallback when role does not match any allowed roles', () => {
      (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ user: { id: '2', email: 'admin@example.com', name: 'Admin User', role: 'admin' } })
      );

      const { getByText, queryByText } = render(
        <RoleGuard allowedRoles={['seller', 'client']} fallback={<Text>Role Not Allowed</Text>}>
          <Text>Admin Content</Text>
        </RoleGuard>
      );

      expect(getByText('Role Not Allowed')).toBeTruthy();
      expect(queryByText('Admin Content')).toBeNull();
    });
  });
});
