/**
 * Get user type badge configuration
 *
 * Maps user roles to badge variants and translated labels.
 * Returns the appropriate badge styling and label for the user's role.
 *
 * @param role - The user's role (client, seller, admin, etc.)
 * @param t - Translation function from useTranslation hook
 * @returns Object containing badge action variant and translated label
 *
 * @example
 * getUserTypeBadge('client', t) // Returns { action: 'info', label: 'Cliente' }
 * getUserTypeBadge('seller', t) // Returns { action: 'success', label: 'Vendedor' }
 */
export const getUserTypeBadge = <T extends (key: any, params?: any) => string>(
  role: string | undefined,
  t: T
): { action: 'success' | 'info' | 'warning'; label: string } => {
  switch (role?.toLowerCase()) {
    case 'client':
      return { action: 'info', label: t('account.userTypes.client') };
    case 'seller':
      return { action: 'success', label: t('account.userTypes.seller') };
    case 'admin':
      return { action: 'warning', label: t('account.userTypes.admin') };
    default:
      return { action: 'info', label: t('account.userTypes.user') };
  }
};
