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
  isCheckingStatus: boolean;
}

interface AppInfoActions {
  checkAppStatus: () => Promise<void>;
}

const currentVersion = getCurrentVersion();

const useAppInfoStore = create<AppInfoState & AppInfoActions>((set, get) => ({
  appInfo: null,
  isUnderMaintenance: false,
  needsUpdate: false,
  isCheckingStatus: false,

  checkAppStatus: async () => {
    const { isCheckingStatus } = get();

    if (isCheckingStatus) {
      return;
    }

    const setLoading = useUIStore.getState().setLoading;
    const setError = useUIStore.getState().setError;

    try {
      set({ isCheckingStatus: true });
      setLoading(true);
      setError(null);

      const latestAppInfo = await getLatestAppInfo();

      if (!latestAppInfo) {
        throw new Error("Failed to fetch app info");
      }

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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch app info";
      setError(errorMessage);
      console.error("[useAppInfoStore] Error checking app status:", err);
    } finally {
      setLoading(false);
      set({ isCheckingStatus: false });
    }
  },
}));

export default useAppInfoStore;
