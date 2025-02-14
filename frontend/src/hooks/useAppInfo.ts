import { useState, useMemo, useCallback } from "react";
import { AppInfo } from "@src/types";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import {
  getLatestAppInfo,
  getCurrentVersion,
} from "@services/data/appInfoService";

export const useAppInfo = () => {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const currentVersion = useMemo(() => getCurrentVersion(), []);

  const { needsUpdate, isUnderMaintenance } = useMemo(
    () => ({
      needsUpdate:
        (appInfo?.minimumVersion && appInfo.minimumVersion > currentVersion) ||
        (appInfo?.currentVersion !== currentVersion && appInfo?.forceUpdate),
      isUnderMaintenance: appInfo?.isMaintenance ?? false,
    }),
    [appInfo, currentVersion]
  );

  const fetchAppInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const latestAppInfo = await getLatestAppInfo();
      setAppInfo(latestAppInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch app info");
      console.error("Error fetching app info:", err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    appInfo,
    isLoading,
    error,
    needsUpdate,
    isUnderMaintenance,
    currentVersion,
    fetchAppInfo,
  };
};
