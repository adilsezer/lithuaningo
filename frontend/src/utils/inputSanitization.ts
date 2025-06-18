/**
 * Input sanitization utilities
 * Simple, DRY functions to sanitize user input
 */

/**
 * Characters that are commonly used in XSS attacks
 */
const DANGEROUS_CHARS = /[<>"'&]/g;

/**
 * Characters that could be used in SQL injection (additional protection)
 */
const SQL_CHARS = /[';-]/g;

/**
 * Replaces dangerous characters with HTML entities
 */
const CHAR_MAP: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "&": "&amp;",
};

/**
 * Basic HTML sanitization - removes/encodes dangerous characters
 * @param input - The string to sanitize
 * @returns Sanitized string safe for display
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== "string") return "";
  return input.replace(DANGEROUS_CHARS, (char) => CHAR_MAP[char] || char);
};

/**
 * Removes potential SQL injection characters
 * @param input - The string to sanitize
 * @returns String with SQL injection characters removed
 */
export const sanitizeSql = (input: string): string => {
  if (typeof input !== "string") return "";
  return input.replace(SQL_CHARS, "");
};

/**
 * General text sanitization - combines HTML and SQL sanitization
 * Use this for user input that will be stored or displayed
 * @param input - The string to sanitize
 * @returns Fully sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return sanitizeSql(sanitizeHtml(input)).trim();
};

/**
 * Sanitizes an object's string properties
 * @param obj - Object to sanitize
 * @param fields - Array of field names to sanitize
 * @returns New object with sanitized fields
 */
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T => {
  const sanitized = { ...obj };

  fields.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeInput(
        sanitized[field] as string
      ) as T[keyof T];
    }
  });

  return sanitized;
};

/**
 * Validates that a string doesn't contain dangerous patterns
 * @param input - String to validate
 * @returns true if safe, false if contains dangerous patterns
 */
export const isInputSafe = (input: string): boolean => {
  if (typeof input !== "string") return false;

  // Check for script tags, javascript: protocol, and common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /eval\(/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
};
