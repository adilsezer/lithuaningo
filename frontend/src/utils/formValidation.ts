// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Form Validation Rules
export const FORM_RULES = {
  email: {
    required: "Email is required",
    pattern: {
      value: VALIDATION_PATTERNS.EMAIL,
      message: "Invalid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      value: VALIDATION_PATTERNS.PASSWORD,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
    },
  },
  name: {
    required: "Name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters",
    },
    maxLength: {
      value: 50,
      message: "Name cannot exceed 50 characters",
    },
  },
} as const;
