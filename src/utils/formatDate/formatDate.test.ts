import { formatDate, formatDateTime, formatTime, isToday, isPast } from './formatDate';

describe('formatDate', () => {
  it('formats Date object to localized string', () => {
    const date = new Date('2025-01-15T09:00:00');
    const result = formatDate(date);
    expect(result).toContain('2025');
    expect(result).toContain('15');
  });

  it('formats date string to localized string', () => {
    const result = formatDate('2025-01-15T12:00:00');
    expect(result).toContain('2025');
    expect(result).toContain('15');
  });

  it('returns "Invalid date" for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
    expect(formatDate(new Date('invalid'))).toBe('Invalid date');
  });

  it('respects locale parameter', () => {
    const date = new Date('2025-01-15');
    const usResult = formatDate(date, 'en-US');
    const esResult = formatDate(date, 'es-ES');
    // Both should contain the year but format differently
    expect(usResult).toContain('2025');
    expect(esResult).toContain('2025');
  });
});

describe('formatDateTime', () => {
  it('formats date with time', () => {
    const date = new Date('2025-01-15T09:30:00');
    const result = formatDateTime(date);
    expect(result).toContain('2025');
    expect(result).toContain('15');
  });

  it('returns "Invalid date" for invalid input', () => {
    expect(formatDateTime('not-a-date')).toBe('Invalid date');
  });
});

describe('formatTime', () => {
  it('formats time from date', () => {
    const date = new Date('2025-01-15T09:30:00');
    const result = formatTime(date);
    expect(result).toContain('9');
    expect(result).toContain('30');
  });

  it('returns "Invalid time" for invalid input', () => {
    expect(formatTime('not-a-date')).toBe('Invalid time');
  });
});

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isToday(tomorrow)).toBe(false);
  });

  it('handles date strings', () => {
    const todayString = new Date().toISOString();
    expect(isToday(todayString)).toBe(true);
  });
});

describe('isPast', () => {
  it('returns true for past dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(isPast(pastDate)).toBe(true);
  });

  it('returns false for future dates', () => {
    const futureDate = new Date('2030-01-01');
    expect(isPast(futureDate)).toBe(false);
  });

  it('handles date strings', () => {
    expect(isPast('2020-01-01')).toBe(true);
    expect(isPast('2030-01-01')).toBe(false);
  });
});
