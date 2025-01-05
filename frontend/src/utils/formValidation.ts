// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Form Validation Rules
export const FORM_RULES = {
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.EMAIL,
    message: "Invalid email address",
  },
  password: {
    required: true,
    pattern: VALIDATION_PATTERNS.PASSWORD,
    minLength: 8,
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: "Name must be between 2 and 50 characters",
  },
} as const;
