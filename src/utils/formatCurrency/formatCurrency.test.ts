import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats positive amounts in Colombian Pesos', () => {
    expect(formatCurrency(1000)).toContain('1.000');
    expect(formatCurrency(10000)).toContain('10.000');
    expect(formatCurrency(1000000)).toContain('1.000.000');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('formats negative amounts', () => {
    const result = formatCurrency(-1000);
    expect(result).toContain('1.000');
    expect(result).toMatch(/-/);
  });

  it('rounds decimal values to whole numbers', () => {
    expect(formatCurrency(1000.99)).toContain('1.001');
    expect(formatCurrency(1000.49)).toContain('1.000');
  });

  it('handles large amounts', () => {
    expect(formatCurrency(999999999)).toContain('999.999.999');
  });
});
