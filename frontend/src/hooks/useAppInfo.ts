import { useMemo, useEffect } from "react";
import { Linking } from "react-native";
import useAppInfoStore from "@src/stores/useAppInfoStore";
import { useIsLoading, useError } from "@src/stores/useUIStore";
import { getCurrentVersion } from "@src/services/data/appInfoService";

/**
 * Hook to manage app information and version checks
 */
export const useAppInfo = () => {
  // Get app info from dedicated store
  const { appInfo, needsUpdate, isUnderMaintenance, checkAppStatus } =
    useAppInfoStore();

  // Get loading and error states from UI store
  const loading = useIsLoading();
  const error = useError();

  const currentVersion = getCurrentVersion();

  // Check app status on mount
  useEffect(() => {
    checkAppStatus();
  }, [checkAppStatus]);

  // Calculate force update status
  const forceUpdate = useMemo(() => {
    if (!appInfo) return false;
    return needsUpdate && appInfo.forceUpdate;
  }, [appInfo, needsUpdate]);

  // Handle update URL opening
  const openUpdateUrl = async () => {
    if (!appInfo?.updateUrl) {
      console.warn("[useAppInfo] No update URL available");
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(appInfo.updateUrl);
      if (canOpen) {
        await Linking.openURL(appInfo.updateUrl);
      } else {
        console.warn("[useAppInfo] Cannot open update URL:", appInfo.updateUrl);
      }
    } catch (error) {
      console.error("[useAppInfo] Error opening update URL:", error);
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
    forceUpdate,
    isUnderMaintenance,

    // Content
    maintenanceMessage: appInfo?.maintenanceMessage || "",
    releaseNotes: appInfo?.releaseNotes || "",

    // Actions
    checkAppStatus,
    openUpdateUrl,
  };
};
