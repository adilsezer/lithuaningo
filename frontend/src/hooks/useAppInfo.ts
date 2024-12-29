import { useState, useMemo } from "react";
import { AppInfo } from "@src/types";
import {
  getLatestAppInfo,
  getCurrentVersion,
} from "@services/data/appInfoService";

export const useAppInfo = () => {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentVersion = useMemo(() => getCurrentVersion(), []);

  const { needsUpdate, isUnderMaintenance } = useMemo(
    () => ({
      needsUpdate:
        appInfo?.latestVersion !== currentVersion && appInfo?.mandatoryUpdate,
      isUnderMaintenance: appInfo?.isUnderMaintenance ?? false,
    }),
    [appInfo, currentVersion]
  );

  const fetchAppInfo = async () => {
    try {
      setLoading(true);
      const latestAppInfo = await getLatestAppInfo();
      setAppInfo(latestAppInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch app info");
      console.error("Error fetching app info:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    appInfo,
    loading,
    error,
    needsUpdate,
    isUnderMaintenance,
    currentVersion,
    fetchAppInfo,
  };
};
