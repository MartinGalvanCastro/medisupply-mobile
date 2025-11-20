import { getInstitutionTypeLabel } from './getInstitutionTypeLabel';

describe('getInstitutionTypeLabel', () => {
  // Mock translation function
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'account.institutionTypes.hospital': 'Hospital',
      'account.institutionTypes.clinica': 'Clínica',
      'account.institutionTypes.laboratorio': 'Laboratorio',
      'account.institutionTypes.farmacia': 'Farmacia',
    };
    return translations[key] || key;
  };

  it('returns translated label for hospital', () => {
    expect(getInstitutionTypeLabel('hospital', mockT)).toBe('Hospital');
    expect(getInstitutionTypeLabel('HOSPITAL', mockT)).toBe('Hospital');
  });

  it('returns translated label for clinica', () => {
    expect(getInstitutionTypeLabel('clinica', mockT)).toBe('Clínica');
  });

  it('returns translated label for laboratorio', () => {
    expect(getInstitutionTypeLabel('laboratorio', mockT)).toBe('Laboratorio');
  });

  it('returns translated label for farmacia', () => {
    expect(getInstitutionTypeLabel('farmacia', mockT)).toBe('Farmacia');
  });

  it('returns raw type for unknown types', () => {
    expect(getInstitutionTypeLabel('otro', mockT)).toBe('otro');
    expect(getInstitutionTypeLabel('custom', mockT)).toBe('custom');
  });

  it('returns N/A for undefined type', () => {
    expect(getInstitutionTypeLabel(undefined, mockT)).toBe('N/A');
  });

  it('is case insensitive', () => {
    expect(getInstitutionTypeLabel('HOSPITAL', mockT)).toBe('Hospital');
    expect(getInstitutionTypeLabel('Hospital', mockT)).toBe('Hospital');
    expect(getInstitutionTypeLabel('hOsPiTaL', mockT)).toBe('Hospital');
  });
});
