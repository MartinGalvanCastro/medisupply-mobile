/**
 * Format date utility functions for consistent date display
 */

/**
 * Format a date string or Date object to a localized date string
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export const formatDate = (date: string | Date, locale: string = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date string or Date object to include time
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date and time string (e.g., "Jan 15, 2025, 9:00 AM")
 */
export const formatDateTime = (date: string | Date, locale: string = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Format time from a date string or Date object
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted time string (e.g., "9:00 AM")
 */
export const formatTime = (date: string | Date, locale: string = 'en-US'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }

  return dateObj.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Check if a date is today
 * @param date - Date string or Date object
 * @returns true if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is in the past
 * @param date - Date string or Date object
 * @returns true if date is in the past
 */
export const isPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() < new Date().getTime();
};
