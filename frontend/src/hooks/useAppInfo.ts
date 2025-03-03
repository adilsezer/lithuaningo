import { useMemo } from "react";
import { useAppInfoState, useAppInfoActions } from "@stores/useAppInfoStore";
import {
  getCurrentVersion,
  compareVersions,
} from "@services/data/appInfoService";
import { Linking } from "react-native";
import { VERSION_REGEX } from "@src/types";

export const useAppInfo = () => {
  const { appInfo, loading, error, isUnderMaintenance, needsUpdate } =
    useAppInfoState();
  const { checkAppStatus } = useAppInfoActions();
  const currentVersion = useMemo(() => getCurrentVersion(), []);

  const versionInfo = useMemo(() => {
    const latest = appInfo?.currentVersion;
    const minimum = appInfo?.minimumVersion;
    console.log("[useAppInfo] Current version:", currentVersion);
    console.log("[useAppInfo] Latest version:", latest);
    console.log("[useAppInfo] Minimum version:", minimum);

    return {
      current: currentVersion,
      latest,
      minimum,
      needsUpdate,
      isForceUpdate: appInfo?.forceUpdate && needsUpdate,
      isValidCurrent: VERSION_REGEX.test(currentVersion),
      hasUpdate: latest ? compareVersions(latest, currentVersion) > 0 : false,
      isBelowMinimum: minimum
        ? compareVersions(minimum, currentVersion) > 0
        : false,
    };
  }, [appInfo, currentVersion, needsUpdate]);

  const maintenanceInfo = useMemo(
    () => ({
      isUnderMaintenance,
      message: appInfo?.maintenanceMessage,
      startedAt: appInfo?.updatedAt,
    }),
    [isUnderMaintenance, appInfo?.maintenanceMessage, appInfo?.updatedAt]
  );

  const handleUpdate = async () => {
    if (appInfo?.updateUrl) {
      try {
        const canOpen = await Linking.canOpenURL(appInfo.updateUrl);
        if (!canOpen) {
          throw new Error("Cannot open update URL");
        }
        await Linking.openURL(appInfo.updateUrl);
      } catch (err) {
        console.error("[useAppInfo] Failed to open update URL:", err);
      }
    }
  };

  return {
    // Basic state
    loading,
    error,

    // Version information
    versionInfo,

    // Maintenance information
    maintenanceInfo,

    // Release information
    releaseNotes: appInfo?.releaseNotes,
    lastUpdated: appInfo?.updatedAt,

    // Actions
    checkAppStatus,
    handleUpdate,
  };
};
