import { create } from "zustand";
import { router } from "expo-router";
import {
  getLatestAppInfo,
  getCurrentVersion,
  compareVersions,
} from "@services/data/appInfoService";
import type { AppInfoResponse } from "@src/types/AppInfo";
import useUIStore from "./useUIStore";

interface AppInfoState {
  appInfo: AppInfoResponse | null;
  isUnderMaintenance: boolean;
  needsUpdate: boolean;
}

interface AppInfoActions {
  checkAppStatus: () => Promise<void>;
}

const currentVersion = getCurrentVersion();

const useAppInfoStore = create<AppInfoState & AppInfoActions>((set) => ({
  appInfo: null,
  isUnderMaintenance: false,
  needsUpdate: false,

  checkAppStatus: async () => {
    // Get setLoading and setError from UI store
    const setLoading = useUIStore.getState().setLoading;
    const setError = useUIStore.getState().setError;

    try {
      setLoading(true);
      setError(null);

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
      });

      if (needsUpdate || latestAppInfo.isMaintenance) {
        router.replace("/notification");
      }

      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch app info";
      setError(errorMessage);
      setLoading(false);
      console.error("[useAppInfoStore] Error checking app status:", err);
    }
  },
}));

export default useAppInfoStore;
