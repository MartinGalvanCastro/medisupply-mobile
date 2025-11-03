import { getUserTypeBadge } from './getUserTypeBadge';

// Mock translation function
const mockT = (key: string) => key;

describe('getUserTypeBadge()', () => {
  describe('Valid User Types', () => {
    it('should return success action for seller role', () => {
      const result = getUserTypeBadge('seller', mockT);
      expect(result.action).toBe('success');
      expect(result.label).toBe('account.userTypes.seller');
    });

    it('should return warning action for admin role', () => {
      const result = getUserTypeBadge('admin', mockT);
      expect(result.action).toBe('warning');
      expect(result.label).toBe('account.userTypes.admin');
    });

    it('should return info action for client role', () => {
      const result = getUserTypeBadge('client', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.client');
    });

    it('should return info action for user role', () => {
      const result = getUserTypeBadge('user', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });
  });

  describe('Case Insensitivity', () => {
    it('should handle uppercase role', () => {
      const result = getUserTypeBadge('SELLER', mockT);
      expect(result.action).toBe('success');
      expect(result.label).toBe('account.userTypes.seller');
    });

    it('should handle mixed case role', () => {
      const result = getUserTypeBadge('CliEnT', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.client');
    });

    it('should handle uppercase admin', () => {
      const result = getUserTypeBadge('ADMIN', mockT);
      expect(result.action).toBe('warning');
      expect(result.label).toBe('account.userTypes.admin');
    });
  });

  describe('Invalid User Types', () => {
    it('should return default info action for unknown role', () => {
      const result = getUserTypeBadge('unknown', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });

    it('should return default info action for undefined role', () => {
      const result = getUserTypeBadge(undefined, mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });

    it('should return default info action for empty string', () => {
      const result = getUserTypeBadge('', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });

    it('should return default info action for null role', () => {
      const result = getUserTypeBadge(null as any, mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });

    it('should return default info action for whitespace role', () => {
      const result = getUserTypeBadge('   ', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });
  });

  describe('Special Cases', () => {
    it('should handle role with whitespace', () => {
      const result = getUserTypeBadge(' seller ', mockT);
      // Note: toLowerCase() on ' seller ' returns ' seller ' which doesn't match
      // This test documents current behavior
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });

    it('should handle role with numbers', () => {
      const result = getUserTypeBadge('seller123', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });
  });

  describe('Return Type Structure', () => {
    it('should return object with action and label properties', () => {
      const result = getUserTypeBadge('admin', mockT);
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('label');
      expect(typeof result.action).toBe('string');
      expect(typeof result.label).toBe('string');
    });

    it('should return correct action type enum values', () => {
      const validActions = ['success', 'info', 'warning'];

      expect(validActions).toContain(getUserTypeBadge('seller', mockT).action);
      expect(validActions).toContain(getUserTypeBadge('client', mockT).action);
      expect(validActions).toContain(getUserTypeBadge('admin', mockT).action);
    });
  });

  describe('Translation Function Integration', () => {
    it('should call translation function with correct key for seller', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getUserTypeBadge('seller', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.userTypes.seller');
    });

    it('should call translation function with correct key for client', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getUserTypeBadge('client', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.userTypes.client');
    });

    it('should call translation function with correct key for admin', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getUserTypeBadge('admin', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.userTypes.admin');
    });

    it('should call translation function with user type key for unknown role', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getUserTypeBadge('unknown', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.userTypes.user');
    });

    it('should return translated label from translation function', () => {
      const mockTranslate = jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'account.userTypes.seller': 'Vendedor',
          'account.userTypes.client': 'Cliente',
          'account.userTypes.admin': 'Administrador',
          'account.userTypes.user': 'Usuario',
        };
        return translations[key] || 'Unknown';
      });

      const sellerResult = getUserTypeBadge('seller', mockTranslate);
      expect(sellerResult.label).toBe('Vendedor');

      const clientResult = getUserTypeBadge('client', mockTranslate);
      expect(clientResult.label).toBe('Cliente');
    });
  });

  describe('All Roles Mapping', () => {
    it('should map client to info action', () => {
      expect(getUserTypeBadge('client', mockT).action).toBe('info');
    });

    it('should map seller to success action', () => {
      expect(getUserTypeBadge('seller', mockT).action).toBe('success');
    });

    it('should map admin to warning action', () => {
      expect(getUserTypeBadge('admin', mockT).action).toBe('warning');
    });

    it('should map unknown to info action with user label', () => {
      const result = getUserTypeBadge('guest', mockT);
      expect(result.action).toBe('info');
      expect(result.label).toBe('account.userTypes.user');
    });
  });
});
