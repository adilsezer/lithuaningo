import Constants from 'expo-constants';
import { AppInfoResponse } from '@src/types/AppInfo';
import { Platform } from 'react-native';
import { apiClient } from '@services/api/apiClient';

// Local version regex pattern to validate X.Y.Z format
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Validates a version string against the X.Y.Z format
 */
const isValidVersion = (version: string): boolean => {
  return VERSION_REGEX.test(version);
};

/**
 * Compares two version strings (semver format X.Y.Z)
 * @param v1 First version string
 * @param v2 Second version string
 * @returns negative if v1 < v2, 0 if equal, positive if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  // Validate inputs
  if (!isValidVersion(v1) || !isValidVersion(v2)) {
    throw new Error('Invalid version format. Must be X.Y.Z');
  }

  // Split and convert to numbers
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  // Compare each segment
  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] !== v2Parts[i]) {
      return v1Parts[i] - v2Parts[i];
    }
  }

  // Versions are equal
  return 0;
};

/**
 * Retrieves the latest app information for the current platform
 */
export const getLatestAppInfo = async (): Promise<AppInfoResponse | null> => {
  try {
    return await apiClient.getAppInfo(Platform.OS);
  } catch (error) {
    console.error('[appInfoService] Error getting app info:', error);
    return null;
  }
};

/**
 * Gets the current app version from Expo config
 */
export const getCurrentVersion = (): string => {
  const version = Constants.expoConfig?.version;
  if (!version || !isValidVersion(version)) {
    return '0.0.0';
  }
  return version;
};
