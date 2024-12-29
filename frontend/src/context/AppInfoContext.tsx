import React, { createContext, useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  getLatestAppInfo,
  getCurrentVersion,
} from "@services/data/appInfoService";
import type { AppInfo } from "@src/types";

interface AppInfoContextType {
  appInfo: AppInfo | null;
  loading: boolean;
  error: string | null;
  isUnderMaintenance: boolean;
  needsUpdate: boolean;
}

const AppInfoContext = createContext<AppInfoContextType | undefined>(undefined);

export const AppInfoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentVersion = getCurrentVersion();

  useEffect(() => {
    const checkAppStatus = async () => {
      try {
        const latestAppInfo = await getLatestAppInfo();
        setAppInfo(latestAppInfo);

        if (
          latestAppInfo &&
          ((latestAppInfo.latestVersion !== currentVersion &&
            latestAppInfo.mandatoryUpdate) ||
            latestAppInfo.isUnderMaintenance)
        ) {
          router.replace("/notification");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch app info"
        );
        console.error("Error fetching app info:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAppStatus();
  }, [currentVersion]);

  const value = {
    appInfo,
    loading,
    error,
    isUnderMaintenance: appInfo?.isUnderMaintenance ?? false,
    needsUpdate:
      (appInfo?.latestVersion !== currentVersion && appInfo?.mandatoryUpdate) ??
      false,
  };

  return (
    <AppInfoContext.Provider value={value}>{children}</AppInfoContext.Provider>
  );
};

export const useAppInfo = () => {
  const context = useContext(AppInfoContext);
  if (context === undefined) {
    throw new Error("useAppInfo must be used within an AppInfoProvider");
  }
  return context;
};
