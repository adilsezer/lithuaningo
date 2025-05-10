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
};

// Package Identifiers
export const PACKAGE_IDENTIFIERS = {
  premium_monthly:
    process.env.EXPO_PUBLIC_REVENUECAT_MONTHLY_PACKAGE_ID || "premium_monthly",
  premium_yearly:
    process.env.EXPO_PUBLIC_REVENUECAT_YEARLY_PACKAGE_ID || "premium_yearly",
  premium_lifetime:
    process.env.EXPO_PUBLIC_REVENUECAT_LIFETIME_PACKAGE_ID ||
    "premium_lifetime",
};

// Debug settings
export const DEBUG_SETTINGS = {
  // Set to true during development, false in production
  enableDebugLogs: __DEV__,
};
