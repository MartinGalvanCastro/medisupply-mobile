/**
 * Get translated institution type label
 *
 * Maps institution type codes to their translated display labels.
 * Falls back to the raw type value if no translation is found.
 *
 * @param type - The institution type code
 * @param t - Translation function from useTranslation hook
 * @returns Translated institution type label or 'N/A' if not provided
 *
 * @example
 * getInstitutionTypeLabel('hospital', t) // Returns "Hospital"
 * getInstitutionTypeLabel('clinica', t) // Returns "Clínica"
 * getInstitutionTypeLabel(undefined, t) // Returns "N/A"
 */
export const getInstitutionTypeLabel = <T extends (key: any, params?: any) => string>(
  type: string | undefined,
  t: T
): string => {
  switch (type?.toLowerCase()) {
    case 'hospital':
      return t('account.institutionTypes.hospital');
    case 'clinica':
      return t('account.institutionTypes.clinica');
    case 'laboratorio':
      return t('account.institutionTypes.laboratorio');
    case 'farmacia':
      return t('account.institutionTypes.farmacia');
    default:
      return type || 'N/A';
  }
};
