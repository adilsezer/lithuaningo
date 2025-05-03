/**
 * Regular expression patterns for form validation
 * These patterns are used in conjunction with Zod schemas for form validation
 */

/**
 * Authentication related validation patterns
 */
export const AUTH_PATTERNS = {
  /**
   * Email validation pattern
   * Validates standard email format: username@domain.tld
   */
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,

  /**
   * Password validation pattern
   * Requires:
   * - At least 8 characters
   * - One uppercase letter
   * - One lowercase letter
   * - One number
   * - One special character (@$!%*?&)
   */
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;
