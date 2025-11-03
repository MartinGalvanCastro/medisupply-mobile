import { getInstitutionTypeLabel } from './getInstitutionTypeLabel';

// Mock translation function
const mockT = (key: string) => key;

describe('getInstitutionTypeLabel()', () => {
  describe('Valid Institution Types', () => {
    it('should return hospital label for hospital type', () => {
      const label = getInstitutionTypeLabel('hospital', mockT);
      expect(label).toBe('account.institutionTypes.hospital');
    });

    it('should return clinica label for clinica type', () => {
      const label = getInstitutionTypeLabel('clinica', mockT);
      expect(label).toBe('account.institutionTypes.clinica');
    });

    it('should return laboratorio label for laboratorio type', () => {
      const label = getInstitutionTypeLabel('laboratorio', mockT);
      expect(label).toBe('account.institutionTypes.laboratorio');
    });

    it('should return farmacia label for farmacia type', () => {
      const label = getInstitutionTypeLabel('farmacia', mockT);
      expect(label).toBe('account.institutionTypes.farmacia');
    });
  });

  describe('Case Insensitivity', () => {
    it('should handle uppercase hospital', () => {
      const label = getInstitutionTypeLabel('HOSPITAL', mockT);
      expect(label).toBe('account.institutionTypes.hospital');
    });

    it('should handle mixed case clinica', () => {
      const label = getInstitutionTypeLabel('ClInIcA', mockT);
      expect(label).toBe('account.institutionTypes.clinica');
    });

    it('should handle uppercase laboratorio', () => {
      const label = getInstitutionTypeLabel('LABORATORIO', mockT);
      expect(label).toBe('account.institutionTypes.laboratorio');
    });

    it('should handle uppercase farmacia', () => {
      const label = getInstitutionTypeLabel('FARMACIA', mockT);
      expect(label).toBe('account.institutionTypes.farmacia');
    });
  });

  describe('Invalid Institution Types', () => {
    it('should return type as is for unknown institution type', () => {
      const label = getInstitutionTypeLabel('unknown', mockT);
      expect(label).toBe('unknown');
    });

    it('should return N/A for undefined type', () => {
      const label = getInstitutionTypeLabel(undefined, mockT);
      expect(label).toBe('N/A');
    });

    it('should return N/A for empty string', () => {
      const label = getInstitutionTypeLabel('', mockT);
      expect(label).toBe('N/A');
    });

    it('should return N/A for null type', () => {
      const label = getInstitutionTypeLabel(null as any, mockT);
      expect(label).toBe('N/A');
    });

    it('should return unknown type as is', () => {
      const label = getInstitutionTypeLabel('pharmacy', mockT); // English variant
      expect(label).toBe('pharmacy');
    });

    it('should return type with typo as is', () => {
      const label = getInstitutionTypeLabel('hosptial', mockT);
      expect(label).toBe('hosptial');
    });
  });

  describe('Edge Cases', () => {
    it('should handle type with whitespace', () => {
      // toLowerCase() preserves whitespace
      const label = getInstitutionTypeLabel(' hospital ', mockT);
      expect(label).toBe(' hospital ');
    });

    it('should return type with special characters as is', () => {
      const label = getInstitutionTypeLabel('hospital-x', mockT);
      expect(label).toBe('hospital-x');
    });

    it('should handle numeric types', () => {
      const label = getInstitutionTypeLabel('hospital123', mockT);
      expect(label).toBe('hospital123');
    });
  });

  describe('Return Type', () => {
    it('should always return a string', () => {
      expect(typeof getInstitutionTypeLabel('hospital', mockT)).toBe('string');
      expect(typeof getInstitutionTypeLabel('unknown', mockT)).toBe('string');
      expect(typeof getInstitutionTypeLabel(undefined, mockT)).toBe('string');
    });
  });

  describe('Translation Function Integration', () => {
    it('should call translation function with correct key for hospital', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getInstitutionTypeLabel('hospital', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.institutionTypes.hospital');
    });

    it('should call translation function with correct key for clinica', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getInstitutionTypeLabel('clinica', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.institutionTypes.clinica');
    });

    it('should call translation function with correct key for laboratorio', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getInstitutionTypeLabel('laboratorio', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.institutionTypes.laboratorio');
    });

    it('should call translation function with correct key for farmacia', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getInstitutionTypeLabel('farmacia', mockTranslate);
      expect(mockTranslate).toHaveBeenCalledWith('account.institutionTypes.farmacia');
    });

    it('should not call translation function for unknown types', () => {
      const mockTranslate = jest.fn((key: string) => key);
      getInstitutionTypeLabel('unknown_type', mockTranslate);
      // Should return raw value without calling translate
      expect(mockTranslate).not.toHaveBeenCalled();
    });

    it('should return translated value for valid types', () => {
      const mockTranslate = jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'account.institutionTypes.hospital': 'Hospital',
          'account.institutionTypes.clinica': 'Clínica',
          'account.institutionTypes.laboratorio': 'Laboratorio',
          'account.institutionTypes.farmacia': 'Farmacia',
        };
        return translations[key] || key;
      });

      expect(getInstitutionTypeLabel('hospital', mockTranslate)).toBe('Hospital');
      expect(getInstitutionTypeLabel('clinica', mockTranslate)).toBe('Clínica');
      expect(getInstitutionTypeLabel('laboratorio', mockTranslate)).toBe('Laboratorio');
      expect(getInstitutionTypeLabel('farmacia', mockTranslate)).toBe('Farmacia');
    });
  });

  describe('All Institution Type Mappings', () => {
    it('should map hospital to translated hospital label', () => {
      const label = getInstitutionTypeLabel('hospital', mockT);
      expect(label).toBe('account.institutionTypes.hospital');
    });

    it('should map clinica to translated clinica label', () => {
      const label = getInstitutionTypeLabel('clinica', mockT);
      expect(label).toBe('account.institutionTypes.clinica');
    });

    it('should map laboratorio to translated laboratorio label', () => {
      const label = getInstitutionTypeLabel('laboratorio', mockT);
      expect(label).toBe('account.institutionTypes.laboratorio');
    });

    it('should map farmacia to translated farmacia label', () => {
      const label = getInstitutionTypeLabel('farmacia', mockT);
      expect(label).toBe('account.institutionTypes.farmacia');
    });
  });

  describe('Fallback Behavior', () => {
    it('should return raw type when not in mapping', () => {
      const label = getInstitutionTypeLabel('veterinary', mockT);
      expect(label).toBe('veterinary');
    });

    it('should return N/A for falsy values', () => {
      expect(getInstitutionTypeLabel(undefined, mockT)).toBe('N/A');
      expect(getInstitutionTypeLabel('', mockT)).toBe('N/A');
      expect(getInstitutionTypeLabel(null as any, mockT)).toBe('N/A');
    });

    it('should prefer raw type over translation for unknown types', () => {
      const rawType = 'clinic_center';
      const label = getInstitutionTypeLabel(rawType, mockT);
      expect(label).toBe(rawType);
    });
  });
});
