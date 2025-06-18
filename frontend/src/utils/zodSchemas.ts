import { z } from "zod";
import { AUTH_PATTERNS } from "./validationPatterns";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .regex(AUTH_PATTERNS.EMAIL, "Invalid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(
    AUTH_PATTERNS.PASSWORD,
    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  );

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot be longer than 50 characters");

// Common form schemas
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
  answer: z.string().min(1, "Please enter your answer"),
});

export const verifyEmailFormSchema = z.object({
  token: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers")
    .max(6, "Verification code cannot be longer than 6 digits"),
});

export const resetPasswordVerifyFormSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset code is required")
      .length(6, "Reset code must be 6 digits")
      .regex(/^\d+$/, "Reset code must contain only numbers")
      .max(6, "Reset code cannot be longer than 6 digits"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
