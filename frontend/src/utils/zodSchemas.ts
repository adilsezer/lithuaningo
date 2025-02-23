import { z } from "zod";
import { AUTH_PATTERNS } from "./validationPatterns";
import { deckCategories, DeckCategory } from "@src/types/DeckCategory";

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
    (data) => {
      // Password is not required for social auth users
      return true;
    },
    {
      message: "Password is required for email/password users",
      path: ["password"],
    }
  );

const imageFileSchema = z
  .object({
    uri: z.string(),
    type: z.string(),
    name: z.string(),
  })
  .optional();

// New schemas for other forms
export const deckFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must not exceed 1000 characters"),
  category: z
    .enum(deckCategories as readonly [DeckCategory, ...DeckCategory[]])
    .refine((cat) => !["All Decks", "My Decks", "Top Rated"].includes(cat), {
      message: "Invalid category selected",
    }),
  tags: z
    .string()
    .optional()
    .transform((val) => val || "")
    .refine(
      (val) => {
        const tags = val
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        return tags.length <= 10 && tags.every((t) => t.length <= 30);
      },
      {
        message: "Maximum 10 tags, each under 30 characters",
      }
    ),
  isPublic: z.boolean().default(true),
  imageFile: z.any().optional(), // Allow any file type, validation handled by component
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export const flashcardFormSchema = z.object({
  frontWord: z.string().min(1, "Front word is required"),
  backWord: z.string().min(1, "Back word is required"),
  exampleSentence: z.string().min(1, "Example sentence is required"),
  exampleSentenceTranslation: z
    .string()
    .min(1, "Example sentence translation is required"),
});

export const flashcardEditSchema = flashcardFormSchema;

export const reportFormSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  details: z.string().min(1, "Please provide details about the issue"),
});

export const quizFormSchema = z.object({
  answer: z.string().min(1, "Please enter your answer"),
});

export const deckCommentFormSchema = z.object({
  content: z.string().min(1, "Deck comment is required"),
});

export const verifyEmailFormSchema = z.object({
  token: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});

export const resetPasswordVerifyFormSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset code is required")
      .length(6, "Reset code must be 6 digits")
      .regex(/^\d+$/, "Reset code must contain only numbers"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
