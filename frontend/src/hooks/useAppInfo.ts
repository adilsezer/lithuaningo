import { useEffect } from 'react';
import { Linking } from 'react-native';
import useAppInfoStore from '@src/stores/useAppInfoStore';
import { useIsLoading, useError } from '@src/stores/useUIStore';
import { getCurrentVersion } from '@src/services/data/appInfoService';

/**
 * Hook to manage app information and version checks
 */
export const useAppInfo = () => {
  // Get app info from dedicated store
  const {
    appInfo,
    needsUpdate,
    isUnderMaintenance,
    checkAppStatus,
    isCheckingStatus,
    hasFailedCheck,
    lastError,
    resetFailedState,
  } = useAppInfoStore();

  // Get loading and error states from UI store
  const loading = useIsLoading();
  const error = useError();

  const currentVersion = getCurrentVersion();

  // Only check app status on mount if it hasn't already been performed elsewhere
  useEffect(() => {
    // Don't trigger a new check if:
    // - app info exists
    // - check is already in progress
    // - a previous check has failed (prevents continuous retries)
    if (!appInfo && !isCheckingStatus && !hasFailedCheck) {
      checkAppStatus();
    }
  }, [appInfo, checkAppStatus, isCheckingStatus, hasFailedCheck]);

  // Handle update URL opening
  const openUpdateUrl = async () => {
    if (!appInfo?.updateUrl) {
      console.warn('[useAppInfo] No update URL available');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(appInfo.updateUrl);
      if (canOpen) {
        await Linking.openURL(appInfo.updateUrl);
      } else {
        console.warn('[useAppInfo] Cannot open update URL:', appInfo.updateUrl);
      }
    } catch (error) {
      console.error('[useAppInfo] Error opening update URL:', error);
    }
  };

  return {
    // Status
    loading,
    error,

    // App info
    appInfo,

    // Version info
    currentVersion,

    // App state
    needsUpdate,
    isUnderMaintenance,
    hasFailedCheck,
    lastError,

    // Content
    maintenanceMessage: appInfo?.maintenanceMessage || '',
    releaseNotes: appInfo?.releaseNotes || '',

    // Actions
    checkAppStatus,
    resetFailedState,
    openUpdateUrl,
  };
};
