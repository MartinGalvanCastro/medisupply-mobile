import { getUserTypeBadge } from './getUserTypeBadge';

describe('getUserTypeBadge', () => {
  // Mock translation function
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'account.userTypes.client': 'Cliente',
      'account.userTypes.seller': 'Vendedor',
      'account.userTypes.admin': 'Administrador',
      'account.userTypes.user': 'Usuario',
    };
    return translations[key] || key;
  };

  it('returns info badge for client', () => {
    const result = getUserTypeBadge('client', mockT);
    expect(result.action).toBe('info');
    expect(result.label).toBe('Cliente');
  });

  it('returns success badge for seller', () => {
    const result = getUserTypeBadge('seller', mockT);
    expect(result.action).toBe('success');
    expect(result.label).toBe('Vendedor');
  });

  it('returns warning badge for admin', () => {
    const result = getUserTypeBadge('admin', mockT);
    expect(result.action).toBe('warning');
    expect(result.label).toBe('Administrador');
  });

  it('returns default user badge for unknown roles', () => {
    const result = getUserTypeBadge('unknown', mockT);
    expect(result.action).toBe('info');
    expect(result.label).toBe('Usuario');
  });

  it('returns default user badge for undefined role', () => {
    const result = getUserTypeBadge(undefined, mockT);
    expect(result.action).toBe('info');
    expect(result.label).toBe('Usuario');
  });

  it('is case insensitive', () => {
    expect(getUserTypeBadge('CLIENT', mockT).action).toBe('info');
    expect(getUserTypeBadge('SELLER', mockT).action).toBe('success');
    expect(getUserTypeBadge('ADMIN', mockT).action).toBe('warning');
  });
});
