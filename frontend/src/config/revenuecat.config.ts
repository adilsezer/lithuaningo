/**
 * RevenueCat Configuration
 *
 * This file contains all configuration related to RevenueCat integration.
 * Values are loaded from environment variables for security.
 */

// API Keys
export const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "",
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "",
};

// Entitlement IDs
export const ENTITLEMENTS = {
  premium:
    process.env.EXPO_PUBLIC_REVENUECAT_PREMIUM_ENTITLEMENT_ID || "Premium",
} as const;

// Package Identifiers
export const PACKAGE_IDENTIFIERS = {
  premium_monthly: process.env.EXPO_PUBLIC_REVENUECAT_MONTHLY_PACKAGE_ID || "",
  premium_yearly: process.env.EXPO_PUBLIC_REVENUECAT_YEARLY_PACKAGE_ID || "",
  premium_lifetime:
    process.env.EXPO_PUBLIC_REVENUECAT_LIFETIME_PACKAGE_ID || "",
};

// RevenueCat Package Types (as strings, matching RevenueCat's expected values)
export const RC_PACKAGE_TYPES = {
  MONTHLY: "MONTHLY",
  ANNUAL: "ANNUAL",
  LIFETIME: "LIFETIME",
} as const;

// RevenueCat Log Levels
export type RevenueCatLogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

// Debug settings
export const DEBUG_SETTINGS = {
  // Set to true during development, false in production
  enableDebugLogs: __DEV__,
  // Log level for RevenueCat - can be DEBUG, INFO, WARN, or ERROR
  logLevel: (__DEV__ ? "INFO" : "ERROR") as RevenueCatLogLevel, // INFO for development, ERROR for production
};
