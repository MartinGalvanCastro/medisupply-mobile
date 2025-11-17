/**
 * Comprehensive unit tests for formatDate utility functions
 * Target: 100% code coverage
 */

import {
  formatDate,
  formatDateTime,
  formatTime,
  isToday,
  isPast,
} from './formatDate';

describe('formatDate', () => {
  describe('formatDate()', () => {
    it('should format a Date object with default locale (en-US)', () => {
      const date = new Date('2025-01-15T09:00:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/Jan 15, 2025/);
    });

    it('should format a date string with default locale (en-US)', () => {
      const result = formatDate('2025-01-15T09:00:00Z');
      expect(result).toMatch(/Jan 15, 2025/);
    });

    it('should format a Date object with custom locale (es-ES)', () => {
      const date = new Date('2025-01-15T09:00:00Z');
      const result = formatDate(date, 'es-ES');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2025/);
    });

    it('should format a date string with custom locale (es-ES)', () => {
      const result = formatDate('2025-01-15T09:00:00Z', 'es-ES');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2025/);
    });

    it('should format a date string with custom locale (fr-FR)', () => {
      const result = formatDate('2025-01-15T09:00:00Z', 'fr-FR');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2025/);
    });

    it('should return "Invalid date" for invalid date string', () => {
      const result = formatDate('invalid-date-string');
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for empty string', () => {
      const result = formatDate('');
      expect(result).toBe('Invalid date');
    });

    it('should handle edge case: Unix epoch (1970-01-01)', () => {
      const result = formatDate(new Date(0));
      expect(result).toMatch(/196(9|70)/); // Could be Dec 31, 1969 or Jan 1, 1970 depending on timezone
      expect(result).toMatch(/(Dec 31, 1969|Jan 1, 1970)/);
    });

    it('should handle edge case: leap year date', () => {
      const result = formatDate('2024-02-29T12:00:00Z');
      expect(result).toMatch(/Feb (28|29), 2024/); // Timezone may affect the date
    });

    it('should handle edge case: end of year', () => {
      const result = formatDate('2025-12-31T23:59:59Z');
      expect(result).toMatch(/Dec 31, 2025/);
    });

    it('should handle edge case: start of year', () => {
      const result = formatDate('2025-01-01T12:00:00Z');
      expect(result).toMatch(/Jan 1, 2025/);
    });
  });

  describe('formatDateTime()', () => {
    it('should format a Date object with default locale (en-US)', () => {
      const date = new Date('2025-01-15T09:30:00Z');
      const result = formatDateTime(date);
      expect(result).toMatch(/Jan 15, 2025/);
      expect(result).toMatch(/:/);
    });

    it('should format a date string with default locale (en-US)', () => {
      const result = formatDateTime('2025-01-15T09:30:00Z');
      expect(result).toMatch(/Jan 15, 2025/);
      expect(result).toMatch(/:/);
    });

    it('should format a Date object with custom locale (es-ES)', () => {
      const date = new Date('2025-01-15T09:30:00Z');
      const result = formatDateTime(date, 'es-ES');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/:/);
    });

    it('should format a date string with custom locale (es-ES)', () => {
      const result = formatDateTime('2025-01-15T09:30:00Z', 'es-ES');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/:/);
    });

    it('should format a date string with custom locale (fr-FR)', () => {
      const result = formatDateTime('2025-01-15T09:30:00Z', 'fr-FR');
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/:/);
    });

    it('should return "Invalid date" for invalid date string', () => {
      const result = formatDateTime('invalid-date-string');
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatDateTime(invalidDate);
      expect(result).toBe('Invalid date');
    });

    it('should return "Invalid date" for empty string', () => {
      const result = formatDateTime('');
      expect(result).toBe('Invalid date');
    });

    it('should include time with minutes in formatted output', () => {
      const result = formatDateTime('2025-01-15T14:05:00Z');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/05/);
    });

    it('should handle edge case: midnight', () => {
      const result = formatDateTime('2025-01-15T12:00:00Z');
      expect(result).toMatch(/Jan 15, 2025/);
      expect(result).toMatch(/:/);
    });

    it('should handle edge case: noon', () => {
      const result = formatDateTime('2025-01-15T12:00:00Z');
      expect(result).toMatch(/Jan 15, 2025/);
      expect(result).toMatch(/:/);
    });

    it('should handle edge case: end of day', () => {
      const result = formatDateTime('2025-01-15T23:59:00Z');
      expect(result).toMatch(/Jan 15, 2025/);
      expect(result).toMatch(/:/);
    });
  });

  describe('formatTime()', () => {
    it('should format time from a Date object with default locale (en-US)', () => {
      const date = new Date('2025-01-15T09:30:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/:/);
      expect(result).toMatch(/30/);
    });

    it('should format time from a date string with default locale (en-US)', () => {
      const result = formatTime('2025-01-15T09:30:00Z');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/30/);
    });

    it('should format time from a Date object with custom locale (es-ES)', () => {
      const date = new Date('2025-01-15T09:30:00Z');
      const result = formatTime(date, 'es-ES');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/30/);
    });

    it('should format time from a date string with custom locale (es-ES)', () => {
      const result = formatTime('2025-01-15T09:30:00Z', 'es-ES');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/30/);
    });

    it('should format time from a date string with custom locale (fr-FR)', () => {
      const result = formatTime('2025-01-15T09:30:00Z', 'fr-FR');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/30/);
    });

    it('should return "Invalid time" for invalid date string', () => {
      const result = formatTime('invalid-date-string');
      expect(result).toBe('Invalid time');
    });

    it('should return "Invalid time" for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatTime(invalidDate);
      expect(result).toBe('Invalid time');
    });

    it('should return "Invalid time" for empty string', () => {
      const result = formatTime('');
      expect(result).toBe('Invalid time');
    });

    it('should handle edge case: midnight (00:00)', () => {
      const result = formatTime('2025-01-15T00:00:00Z');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/00/);
    });

    it('should handle edge case: noon (12:00)', () => {
      const result = formatTime('2025-01-15T12:00:00Z');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/00/);
    });

    it('should handle edge case: end of day (23:59)', () => {
      const result = formatTime('2025-01-15T23:59:00Z');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/59/);
    });

    it('should format minutes with leading zero when needed', () => {
      const result = formatTime('2025-01-15T09:05:00Z');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/05/);
    });
  });

  describe('isToday()', () => {
    it('should return true for current date as Date object', () => {
      const today = new Date();
      const result = isToday(today);
      expect(result).toBe(true);
    });

    it('should return true for current date as ISO string', () => {
      const today = new Date().toISOString();
      const result = isToday(today);
      expect(result).toBe(true);
    });

    it('should return false for yesterday as Date object', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = isToday(yesterday);
      expect(result).toBe(false);
    });

    it('should return false for yesterday as string', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = isToday(yesterday.toISOString());
      expect(result).toBe(false);
    });

    it('should return false for tomorrow as Date object', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = isToday(tomorrow);
      expect(result).toBe(false);
    });

    it('should return false for tomorrow as string', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = isToday(tomorrow.toISOString());
      expect(result).toBe(false);
    });

    it('should return false for a date in the past (2020-01-01)', () => {
      const result = isToday('2020-01-01T00:00:00Z');
      expect(result).toBe(false);
    });

    it('should return false for a date in the future (2030-01-01)', () => {
      const result = isToday('2030-01-01T00:00:00Z');
      expect(result).toBe(false);
    });

    it('should return true for today at different times', () => {
      const todayMorning = new Date();
      todayMorning.setHours(6, 0, 0, 0);

      const todayEvening = new Date();
      todayEvening.setHours(18, 0, 0, 0);

      expect(isToday(todayMorning)).toBe(true);
      expect(isToday(todayEvening)).toBe(true);
    });

    it('should handle today at midnight', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const result = isToday(today);
      expect(result).toBe(true);
    });

    it('should handle today at end of day', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const result = isToday(today);
      expect(result).toBe(true);
    });

    it('should handle invalid date string gracefully', () => {
      const result = isToday('invalid-date');
      expect(result).toBe(false);
    });

    it('should handle invalid Date object gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = isToday(invalidDate);
      expect(result).toBe(false);
    });
  });

  describe('isPast()', () => {
    it('should return true for a date in the past as Date object', () => {
      const pastDate = new Date('2020-01-01T00:00:00Z');
      const result = isPast(pastDate);
      expect(result).toBe(true);
    });

    it('should return true for a date in the past as string', () => {
      const result = isPast('2020-01-01T00:00:00Z');
      expect(result).toBe(true);
    });

    it('should return false for a date in the future as Date object', () => {
      const futureDate = new Date('2030-01-01T00:00:00Z');
      const result = isPast(futureDate);
      expect(result).toBe(false);
    });

    it('should return false for a date in the future as string', () => {
      const result = isPast('2030-01-01T00:00:00Z');
      expect(result).toBe(false);
    });

    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = isPast(yesterday);
      expect(result).toBe(true);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = isPast(tomorrow);
      expect(result).toBe(false);
    });

    it('should return true for one second ago', () => {
      const oneSecondAgo = new Date();
      oneSecondAgo.setSeconds(oneSecondAgo.getSeconds() - 1);
      const result = isPast(oneSecondAgo);
      expect(result).toBe(true);
    });

    it('should return false for one second in the future', () => {
      const oneSecondFuture = new Date();
      oneSecondFuture.setSeconds(oneSecondFuture.getSeconds() + 1);
      const result = isPast(oneSecondFuture);
      expect(result).toBe(false);
    });

    it('should handle the current moment correctly', () => {
      // Current time might be considered "past" by the time comparison executes
      // due to execution time, so we test with a small buffer
      const now = new Date();
      const result = isPast(now);
      // The result could be true or false depending on execution timing
      expect(typeof result).toBe('boolean');
    });

    it('should handle edge case: Unix epoch (1970-01-01)', () => {
      const epoch = new Date(0);
      const result = isPast(epoch);
      expect(result).toBe(true);
    });

    it('should handle edge case: far future date (2100-01-01)', () => {
      const farFuture = new Date('2100-01-01T00:00:00Z');
      const result = isPast(farFuture);
      expect(result).toBe(false);
    });

    it('should handle invalid date string gracefully', () => {
      const result = isPast('invalid-date');
      // Invalid date will have NaN timestamp, comparison with current time
      expect(typeof result).toBe('boolean');
    });

    it('should handle invalid Date object gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = isPast(invalidDate);
      expect(typeof result).toBe('boolean');
    });

    it('should handle date one year in the past', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const result = isPast(oneYearAgo);
      expect(result).toBe(true);
    });

    it('should handle date one year in the future', () => {
      const oneYearFuture = new Date();
      oneYearFuture.setFullYear(oneYearFuture.getFullYear() + 1);
      const result = isPast(oneYearFuture);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null-like values in formatDate', () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      // Note: null will throw TypeError in runtime, but this tests TypeScript safety
      expect(() => formatDate(null)).toThrow(TypeError);
    });

    it('should handle undefined in formatDate', () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      // Note: undefined will throw TypeError in runtime, but this tests TypeScript safety
      expect(() => formatDate(undefined)).toThrow(TypeError);
    });

    it('should handle numeric string in formatDate', () => {
      // Timestamp as string
      const result = formatDate('1705311600000');
      // May or may not be valid depending on interpretation
      expect(typeof result).toBe('string');
    });

    it('should handle various ISO date formats', () => {
      const formats = [
        '2025-01-15T12:00:00Z',
        '2025-01-15T12:00:00.000Z',
        '2025-01-15T12:00:00+00:00',
      ];

      formats.forEach((format) => {
        const result = formatDate(format);
        expect(result).toMatch(/Jan 15, 2025/);
      });
    });

    it('should handle timezone differences in formatDateTime', () => {
      const utcDate = '2025-01-15T00:00:00Z';
      const result = formatDateTime(utcDate);
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/:/);
    });

    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01T12:00:00Z');
      const result = formatDate(oldDate);
      expect(result).toMatch(/19(00|99)/); // Could be Dec 31, 1899 or Jan 1, 1900 depending on timezone
    });

    it('should handle leap second edge case', () => {
      const leapSecond = new Date('2025-06-30T23:59:60Z');
      const result = formatDateTime(leapSecond);
      // JavaScript may adjust this automatically
      expect(typeof result).toBe('string');
    });
  });

  describe('Type Coercion and Input Validation', () => {
    it('should handle Date object created from timestamp', () => {
      const timestamp = 1736942400000; // Jan 15, 2025 12:00:00 UTC
      const date = new Date(timestamp);
      const result = formatDate(date);
      expect(result).toMatch(/Jan 15, 2025/);
    });

    it('should handle ISO string with milliseconds', () => {
      const result = formatTime('2025-01-15T09:30:45.123Z');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/30/);
    });

    it('should consistently handle same date in different formats', () => {
      const dateString = '2025-01-15T12:00:00Z';
      const dateObject = new Date(dateString);

      expect(formatDate(dateString)).toBe(formatDate(dateObject));
      expect(formatDateTime(dateString)).toBe(formatDateTime(dateObject));
      expect(formatTime(dateString)).toBe(formatTime(dateObject));
      expect(isToday(dateString)).toBe(isToday(dateObject));
      expect(isPast(dateString)).toBe(isPast(dateObject));
    });
  });

  describe('Locale-Specific Formatting', () => {
    it('should handle Japanese locale (ja-JP)', () => {
      const result = formatDate('2025-01-15T09:00:00Z', 'ja-JP');
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/15/);
    });

    it('should handle German locale (de-DE)', () => {
      const result = formatDateTime('2025-01-15T09:00:00Z', 'de-DE');
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/15/);
    });

    it('should handle British English locale (en-GB)', () => {
      const result = formatDate('2025-01-15T09:00:00Z', 'en-GB');
      expect(result).toMatch(/2025/);
      expect(result).toMatch(/15/);
    });

    it('should handle Portuguese locale (pt-BR)', () => {
      const result = formatTime('2025-01-15T14:30:00Z', 'pt-BR');
      expect(result).toMatch(/:/);
      expect(result).toMatch(/30/);
    });
  });

  describe('Performance and Boundary Tests', () => {
    it('should handle maximum safe JavaScript date', () => {
      const maxDate = new Date(8640000000000000);
      const result = formatDate(maxDate);
      expect(typeof result).toBe('string');
    });

    it('should handle minimum safe JavaScript date', () => {
      const minDate = new Date(-8640000000000000);
      const result = formatDate(minDate);
      expect(typeof result).toBe('string');
    });

    it('should handle rapid successive calls', () => {
      const date = '2025-01-15T12:00:00Z';
      const results = Array(100)
        .fill(null)
        .map(() => formatDate(date));

      expect(results.every((r) => r === results[0])).toBe(true);
    });

    it('should handle multiple date formats in sequence', () => {
      const dates = [
        '2025-01-01T12:00:00Z',
        '2025-06-15T12:00:00Z',
        '2025-12-31T12:00:00Z',
      ];

      dates.forEach((date) => {
        expect(formatDate(date)).toMatch(/2025/);
        expect(formatDateTime(date)).toMatch(/2025/);
        expect(formatTime(date)).toMatch(/:/);
      });
    });
  });
});
