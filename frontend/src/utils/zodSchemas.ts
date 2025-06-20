import { z } from "zod";
import { AUTH_PATTERNS } from "./validationPatterns";

// Core validation schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(254, "Email cannot be longer than 254 characters")
  .regex(AUTH_PATTERNS.EMAIL, "Invalid email format");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot be longer than 128 characters")
  .regex(
    AUTH_PATTERNS.PASSWORD,
    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  );

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot be longer than 50 characters")
  .regex(
    /^[a-zA-Z0-9\s._-]+$/,
    "Name can only contain letters, numbers, spaces, dots, underscores, and hyphens"
  );

// Chat message validation
export const chatMessageSchema = z
  .string()
  .min(1, "Message cannot be empty")
  .max(2000, "Message cannot be longer than 2000 characters")
  .trim();

// Challenge answer validation
export const challengeAnswerSchema = z
  .string()
  .min(1, "Please enter your answer")
  .max(500, "Answer cannot be longer than 500 characters")
  .trim();

// Verification token validation
export const verificationTokenSchema = z
  .string()
  .min(1, "Verification code is required")
  .length(6, "Verification code must be 6 digits")
  .regex(/^\d{6}$/, "Verification code must contain only numbers");

// Form schemas
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupFormSchema = z
  .object({
    displayName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    legalAgreement: z.boolean().refine((val) => val === true, {
      message:
        "You must be at least 13 years old and agree to our Terms of Service and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const signupFormSchemaWithoutLegal = z
  .object({
    displayName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const editProfileFormSchema = z
  .object({
    displayName: nameSchema,
    currentPassword: z.string().optional(),
    authProvider: z.string().optional(),
  })
  .refine(
    (data) => {
      // Only require password for email users
      if (data.authProvider === "email") {
        return !!data.currentPassword && data.currentPassword.length >= 1;
      }
      return true;
    },
    {
      message: "Current password is required for email users",
      path: ["currentPassword"],
    }
  );

export const deleteAccountFormSchema = z
  .object({
    password: z
      .string()
      .min(1, "Please enter your password to confirm deletion")
      .optional(),
  })
  .refine(
    (_data) => {
      // Password is not required for social auth users
      return true;
    },
    {
      message: "Password is required for email/password users",
      path: ["password"],
    }
  );

export const challengeFormSchema = z.object({
  answer: challengeAnswerSchema,
});

export const verifyEmailFormSchema = z.object({
  token: verificationTokenSchema,
});

export const resetPasswordVerifyFormSchema = z
  .object({
    token: verificationTokenSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Chat form schema
export const chatFormSchema = z.object({
  message: chatMessageSchema,
});

// Type exports for use in components
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type ChatFormData = z.infer<typeof chatFormSchema>;
export type ChallengeFormData = z.infer<typeof challengeFormSchema>;
