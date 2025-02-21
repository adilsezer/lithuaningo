/**
 * Generates a friendly anonymous name for users without a display name
 * @param userId - The user's unique identifier
 * @returns A generated anonymous name
 */
export const generateAnonymousName = (userId: string): string => {
  // Use the first 4 characters of userId as a base
  const base = userId.slice(0, 4).toUpperCase();

  // Generate a random 4-digit number as a suffix
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `User${base}${suffix}`;
};
