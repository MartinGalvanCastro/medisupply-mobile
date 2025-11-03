import { getInitials } from './getInitials';

describe('getInitials()', () => {
  describe('Single Name Input', () => {
    it('should return first two characters uppercase for single name', () => {
      expect(getInitials('John')).toBe('JO');
    });

    it('should return first two characters uppercase for single short name', () => {
      expect(getInitials('Jo')).toBe('JO');
    });

    it('should return first character uppercase for single character', () => {
      expect(getInitials('J')).toBe('J');
    });

    it('should handle lowercase single names', () => {
      expect(getInitials('john')).toBe('JO');
    });

    it('should handle mixed case single names', () => {
      expect(getInitials('JoHn')).toBe('JO');
    });
  });

  describe('Full Name Input', () => {
    it('should return first letter of first and second names', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return first letter of first and second names with full names', () => {
      expect(getInitials('Jonathan David')).toBe('JD');
    });

    it('should handle lowercase full names', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should handle mixed case full names', () => {
      expect(getInitials('JoHn DoE')).toBe('JD');
    });

    it('should handle three part names (first and second only)', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should handle four part names (first and second only)', () => {
      expect(getInitials('John Michael Robert Doe')).toBe('JM');
    });
  });

  describe('Edge Cases', () => {
    it('should return "U" for undefined input', () => {
      expect(getInitials(undefined)).toBe('U');
    });

    it('should return "U" for empty string', () => {
      expect(getInitials('')).toBe('U');
    });

    it('should return "U" for whitespace only', () => {
      expect(getInitials('   ')).toBe('U');
    });

    it('should handle leading and trailing whitespace', () => {
      expect(getInitials('  John Doe  ')).toBe('JD');
    });

    it('should handle multiple spaces between names', () => {
      expect(getInitials('John    Doe')).toBe('JD');
    });

    it('should handle tabs and special whitespace', () => {
      expect(getInitials('John\tDoe')).toBe('JD');
    });
  });

  describe('Special Characters', () => {
    it('should handle names with hyphens', () => {
      expect(getInitials('John-Paul Smith')).toBe('JS');
    });

    it('should handle names with apostrophes', () => {
      expect(getInitials("O'Brien Smith")).toBe('OS');
    });

    it('should handle accented characters', () => {
      expect(getInitials('José María')).toBe('JM');
    });

    it('should handle unicode characters', () => {
      expect(getInitials('Владимир Петров')).toBe('ВП');
    });

    it('should handle Chinese characters', () => {
      expect(getInitials('李 明')).toBe('李明');
    });
  });

  describe('Case Sensitivity', () => {
    it('should always return uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
      expect(getInitials('JOHN DOE')).toBe('JD');
      expect(getInitials('JoHn DoE')).toBe('JD');
    });
  });

  describe('Boundary Cases - Empty Name Parts', () => {
    it('should handle name with only first character', () => {
      expect(getInitials('A')).toBe('A');
    });

    it('should handle name with exactly two characters', () => {
      expect(getInitials('Jo')).toBe('JO');
    });

    it('should handle single character in each name part', () => {
      expect(getInitials('J D')).toBe('JD');
    });

    it('should handle name with many spaces between parts', () => {
      expect(getInitials('John     Paul     Smith')).toBe('JP');
    });

    it('should return first character only for single character first name and multi-char last name', () => {
      expect(getInitials('J Smith')).toBe('JS');
    });

    it('should return "U" when name is only whitespace characters', () => {
      expect(getInitials('     ')).toBe('U');
    });

    it('should return "U" for null input', () => {
      expect(getInitials(null as any)).toBe('U');
    });
  });

  describe('Numeric and Numeric-like Names', () => {
    it('should handle names starting with numbers', () => {
      expect(getInitials('2Pac Shakur')).toBe('2S');
    });

    it('should handle names that are only numbers', () => {
      expect(getInitials('123 456')).toBe('14');
    });

    it('should handle single digit names', () => {
      expect(getInitials('5')).toBe('5');
    });
  });
});
