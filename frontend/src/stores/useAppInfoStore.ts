import { create } from "zustand";
import { router } from "expo-router";
import {
  getLatestAppInfo,
  getCurrentVersion,
  compareVersions,
} from "@services/data/appInfoService";
import type { AppInfo } from "@src/types/AppInfo";

interface AppInfoState {
  appInfo: AppInfo | null;
  loading: boolean;
  error: string | null;
  isUnderMaintenance: boolean;
  needsUpdate: boolean;
}

interface AppInfoActions {
  checkAppStatus: () => Promise<void>;
}

const currentVersion = getCurrentVersion();

const useAppInfoStore = create<AppInfoState & AppInfoActions>((set) => ({
  appInfo: null,
  loading: true,
  error: null,
  isUnderMaintenance: false,
  needsUpdate: false,

  checkAppStatus: async () => {
    try {
      const latestAppInfo = await getLatestAppInfo();

      if (!latestAppInfo) {
        throw new Error("Failed to fetch app info");
      }

      // Check if minimum version requirement is met
      const needsUpdate =
        compareVersions(latestAppInfo.minimumVersion, currentVersion) > 0 ||
        (compareVersions(latestAppInfo.currentVersion, currentVersion) > 0 &&
          latestAppInfo.forceUpdate);

      set({
        appInfo: latestAppInfo,
        isUnderMaintenance: latestAppInfo.isMaintenance,
        needsUpdate,
        error: null,
        loading: false,
      });

      if (needsUpdate || latestAppInfo.isMaintenance) {
        router.replace("/notification");
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch app info",
        loading: false,
      });
      console.error("[useAppInfoStore] Error checking app status:", err);
    }
  },
}));

// Selectors
export const useAppInfoState = () => {
  const state = useAppInfoStore();
  return {
    appInfo: state.appInfo,
    loading: state.loading,
    error: state.error,
    isUnderMaintenance: state.isUnderMaintenance,
    needsUpdate: state.needsUpdate,
  };
};

export const useAppInfoActions = () => {
  const state = useAppInfoStore();
  return {
    checkAppStatus: state.checkAppStatus,
  };
};

export default useAppInfoStore;
