/**
 * Generate initials from user name
 *
 * Extracts the first letter of the first two words in a name to create initials.
 * If the name has only one word, takes the first two characters.
 * Falls back to 'U' if no name is provided.
 *
 * @param name - The user's full name
 * @returns Uppercase initials (e.g., "JD" for "John Doe")
 *
 * @example
 * getInitials("John Doe") // Returns "JD"
 * getInitials("Madonna") // Returns "MA"
 * getInitials(undefined) // Returns "U"
 */
export const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'U';
  const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0);
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return nameParts[0].substring(0, 2).toUpperCase();
};
