import { z } from "zod";
import { AUTH_PATTERNS } from "./validationPatterns";
import { deckCategories } from "@src/types/DeckCategory";

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

export const editProfileFormSchema = z.object({
  displayName: nameSchema,
  currentPassword: z.string().min(1, "Current password is required"),
});

export const deleteAccountFormSchema = z.object({
  password: z.string().min(1, "Please enter your password to confirm deletion"),
});

// New schemas for other forms
export const deckFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z
      .enum(deckCategories, {
        errorMap: () => ({ message: "Category is required" }),
      })
      .optional(),
    tags: z.preprocess((val) => {
      if (typeof val === "string") {
        return val
          ? val
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined;
      }
      return val;
    }, z.array(z.string()).optional()) as z.ZodType<string[] | undefined>,
    consent: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must agree to the terms before creating a deck",
      })
      .optional(),
  })
  .partial();

export const flashcardFormSchema = z.object({
  front: z.string().min(1, "Front side is required"),
  back: z.string().min(1, "Back side is required"),
  exampleSentence: z.string().optional(),
  audioFile: z.any().optional(),
  imageFile: z.any().optional(),
});

export const flashcardEditSchema = flashcardFormSchema.partial();

export const reportFormSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  details: z.string().min(1, "Please provide details about the issue"),
});

export const quizFormSchema = z.object({
  answer: z.string().min(1, "Please enter your answer"),
});

export const commentFormSchema = z.object({
  content: z.string().min(1, "Comment is required"),
});
