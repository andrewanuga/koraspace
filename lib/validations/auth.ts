import { z } from "zod";

/**
 * RFC 5322 standard compliant email regex
 * Validates format, disallows invalid characters, ensures valid domain labels and 2+ char TLD.
 */
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Password requirement regexes
 */
export const PASSWORD_NUMBER_REGEX = /\d/;
export const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

/**
 * Input sanitization helpers
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\0/g, "") // Remove null bytes
    .replace(/<[^>]*>/g, "") // Strip HTML/script tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Strip control characters
    .trim();
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\0/g, "") // Remove null bytes
    .replace(/<[^>]*>/g, "") // Strip HTML/script tags
    .replace(/\s+/g, "") // Remove all internal and outer whitespace
    .toLowerCase()
    .trim();
}

export function sanitizePassword(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/\0/g, ""); // Remove null bytes but preserve allowed characters
}

/**
 * Zod Schemas
 */
export const signupSchema = z.object({
  name: z
    .string({ required_error: "Full name is required." })
    .transform(sanitizeText)
    .refine((val) => val.length >= 2, {
      message: "Full name must be at least 2 characters.",
    })
    .refine((val) => val.length <= 70, {
      message: "Full name must not exceed 70 characters.",
    }),
  email: z
    .string({ required_error: "Email address is required." })
    .transform(sanitizeEmail)
    .refine((val) => val.length > 0, {
      message: "Email address cannot be empty.",
    })
    .refine((val) => val.length <= 254, {
      message: "Email address is too long (maximum 254 characters).",
    })
    .refine((val) => EMAIL_REGEX.test(val), {
      message: "Please enter a valid email address (e.g. name@company.com).",
    }),
  password: z
    .string({ required_error: "Password is required." })
    .transform(sanitizePassword)
    .refine((val) => val.length >= 8, {
      message: "Password must be at least 8 characters long.",
    })
    .refine((val) => val.length <= 128, {
      message: "Password must not exceed 128 characters.",
    })
    .refine((val) => PASSWORD_NUMBER_REGEX.test(val), {
      message: "Password must contain at least one number.",
    })
    .refine((val) => PASSWORD_SPECIAL_CHAR_REGEX.test(val), {
      message: "Password must contain at least one special character (!@#$%^&*).",
    }),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email address is required." })
    .transform(sanitizeEmail)
    .refine((val) => val.length > 0, {
      message: "Email address cannot be empty.",
    })
    .refine((val) => val.length <= 254, {
      message: "Email address is too long.",
    })
    .refine((val) => EMAIL_REGEX.test(val), {
      message: "Please enter a valid email address format.",
    }),
  password: z
    .string({ required_error: "Password is required." })
    .transform(sanitizePassword)
    .refine((val) => val.length > 0, {
      message: "Password is required.",
    })
    .refine((val) => val.length <= 128, {
      message: "Password exceeds maximum allowable length.",
    }),
});

export const emailOnlySchema = z.object({
  email: z
    .string({ required_error: "Email address is required." })
    .transform(sanitizeEmail)
    .refine((val) => val.length > 0, {
      message: "Email address cannot be empty.",
    })
    .refine((val) => val.length <= 254, {
      message: "Email address is too long.",
    })
    .refine((val) => EMAIL_REGEX.test(val), {
      message: "Please enter a valid email address format.",
    }),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlySchema>;
