import { getInitials } from './getInitials';

describe('getInitials', () => {
  it('returns initials from two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('María García')).toBe('MG');
  });

  it('returns first two letters from single-word name', () => {
    expect(getInitials('Madonna')).toBe('MA');
    expect(getInitials('Prince')).toBe('PR');
  });

  it('handles more than two words', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
    expect(getInitials('María del Carmen García')).toBe('MD');
  });

  it('returns U for undefined or empty input', () => {
    expect(getInitials(undefined)).toBe('U');
    expect(getInitials('')).toBe('U');
    expect(getInitials('   ')).toBe('U');
  });

  it('handles names with extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });

  it('converts to uppercase', () => {
    expect(getInitials('john doe')).toBe('JD');
  });

  it('handles single character names', () => {
    expect(getInitials('A')).toBe('A');
  });
});
