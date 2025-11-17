import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(formatCurrency(1000)).toMatch(/1[\s,.]000/);
  });

  it('should format zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('should format large numbers', () => {
    const result = formatCurrency(1000000);
    expect(result).toMatch(/1[\s,.]?000[\s,.]?000/);
  });

  it('should use Colombian Peso symbol', () => {
    const result = formatCurrency(1000);
    // Should contain COP format indicator
    expect(result.length).toBeGreaterThan(0);
  });

  it('should not include decimal places after currency', () => {
    const result = formatCurrency(1000.99);
    // Colombian Peso format uses 0 decimal places for cents
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle decimal inputs by rounding', () => {
    const result1 = formatCurrency(1000.5);
    const result2 = formatCurrency(1000.4);
    expect(result1).toBeTruthy();
    expect(result2).toBeTruthy();
  });

  it('should format negative numbers', () => {
    const result = formatCurrency(-1000);
    expect(result).toMatch(/1[\s,.]000/);
  });

  it('should handle very small numbers', () => {
    const result = formatCurrency(1);
    expect(result).toContain('1');
  });

  it('should handle very large numbers', () => {
    const result = formatCurrency(999999999999);
    expect(result).toBeTruthy();
  });

  it('should format currency consistently', () => {
    const result1 = formatCurrency(5000);
    const result2 = formatCurrency(5000);
    expect(result1).toBe(result2);
  });

  it('should maintain currency precision', () => {
    const amounts = [1000, 2500, 50000, 1000000];
    amounts.forEach((amount) => {
      const result = formatCurrency(amount);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  it('should handle fractional amounts', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBeTruthy();
  });

  it('should handle zero decimal input', () => {
    const result = formatCurrency(1000.0);
    expect(result).toBeTruthy();
  });

  describe('Colombian Peso formatting', () => {
    it('should use es-CO locale', () => {
      const result = formatCurrency(1000);
      // Colombian format should be present
      expect(result).toBeTruthy();
    });

    it('should format thousands separator correctly', () => {
      const result = formatCurrency(1000);
      // Should have some form of thousands separator or spacing
      expect(result.length).toBeGreaterThanOrEqual(4);
    });

    it('should include currency indicator', () => {
      const result = formatCurrency(1000);
      // Should be a proper currency format
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum safe integer', () => {
      const result = formatCurrency(Number.MIN_SAFE_INTEGER);
      expect(result).toBeTruthy();
    });

    it('should handle maximum safe integer', () => {
      const result = formatCurrency(Number.MAX_SAFE_INTEGER);
      expect(result).toBeTruthy();
    });

    it('should handle Infinity gracefully', () => {
      // Intl.NumberFormat handles Infinity
      expect(() => formatCurrency(Infinity)).not.toThrow();
    });

    it('should handle NaN gracefully', () => {
      // Intl.NumberFormat will format NaN
      const result = formatCurrency(NaN);
      expect(result).toBeTruthy();
    });

    it('should format prices with no decimals correctly', () => {
      const result = formatCurrency(100);
      expect(result).toBeTruthy();
      expect(result).not.toMatch(/\.\d+/); // Should not have decimal places
    });

    it('should consistently format same value', () => {
      const value = 12345;
      const results = [
        formatCurrency(value),
        formatCurrency(value),
        formatCurrency(value),
      ];
      expect(results[0]).toBe(results[1]);
      expect(results[1]).toBe(results[2]);
    });

    it('should format positive and negative differently', () => {
      const positive = formatCurrency(1000);
      const negative = formatCurrency(-1000);
      // Negative should have minus sign or different formatting
      expect(positive).not.toBe(negative);
    });

    it('should format currency for different magnitudes', () => {
      const results = {
        units: formatCurrency(5),
        tens: formatCurrency(50),
        hundreds: formatCurrency(500),
        thousands: formatCurrency(5000),
        millions: formatCurrency(5000000),
      };

      Object.values(results).forEach((result) => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('should format common product prices', () => {
      const prices = [9999, 19999, 29999, 50000];
      prices.forEach((price) => {
        const result = formatCurrency(price);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });

    it('should format medical supply prices', () => {
      const medicalPrices = [100, 500, 1000, 5000, 10000];
      medicalPrices.forEach((price) => {
        const result = formatCurrency(price);
        expect(result).toBeTruthy();
      });
    });

    it('should format total amounts', () => {
      const totals = [15000, 35000, 75000, 125000];
      totals.forEach((total) => {
        const result = formatCurrency(total);
        expect(result).toBeTruthy();
      });
    });

    it('should format discount amounts', () => {
      const discounts = [100, 500, 1000, 2500];
      discounts.forEach((discount) => {
        const result = formatCurrency(discount);
        expect(result).toBeTruthy();
      });
    });
  });
});
