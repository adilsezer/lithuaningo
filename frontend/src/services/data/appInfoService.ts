import Constants from "expo-constants";
import { AppInfo, VERSION_REGEX } from "@src/types/AppInfo";
import { Platform } from "react-native";
import { apiClient } from "@services/api/apiClient";

/**
 * Validates a version string against the X.Y.Z format
 */
const isValidVersion = (version: string): boolean => {
  return VERSION_REGEX.test(version);
};

/**
 * Compares two version strings
 * @returns negative if v1 < v2, 0 if equal, positive if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  if (!isValidVersion(v1) || !isValidVersion(v2)) {
    throw new Error("Invalid version format. Must be X.Y.Z");
  }

  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] !== v2Parts[i]) {
      return v1Parts[i] - v2Parts[i];
    }
  }
  return 0;
};

/**
 * Retrieves the latest app information for the current platform
 */
export const getLatestAppInfo = async (): Promise<AppInfo | null> => {
  try {
    return await apiClient.getAppInfo(Platform.OS);
  } catch (error) {
    console.error("[appInfoService] Failed to fetch app info:", error);
    return null;
  }
};

/**
 * Gets the current app version from Expo config
 */
export const getCurrentVersion = (): string => {
  const version = Constants.expoConfig?.version;
  if (!version || !isValidVersion(version)) {
    return "0.0.0";
  }
  return version;
};
