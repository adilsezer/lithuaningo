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
  hasFailedCheck: boolean;
  lastError: string | null;
}

interface AppInfoActions {
  checkAppStatus: () => Promise<void>;
  resetFailedState: () => void;
}

const currentVersion = getCurrentVersion();

const useAppInfoStore = create<AppInfoState & AppInfoActions>((set, get) => ({
  appInfo: null,
  isUnderMaintenance: false,
  needsUpdate: false,
  isCheckingStatus: false,
  hasFailedCheck: false,
  lastError: null,

  checkAppStatus: async () => {
    const { isCheckingStatus, hasFailedCheck } = get();

    if (isCheckingStatus || hasFailedCheck) {
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

      // Skip maintenance mode in development
      const isMaintenanceMode = __DEV__ ? false : latestAppInfo.isMaintenance;

      if (__DEV__ && latestAppInfo.isMaintenance) {
        console.log(
          "[useAppInfoStore] ⚠️ Maintenance mode detected but skipped in development"
        );
      }

      set({
        appInfo: latestAppInfo,
        isUnderMaintenance: isMaintenanceMode,
        needsUpdate,
        hasFailedCheck: false,
        lastError: null,
      });

      if (needsUpdate || isMaintenanceMode) {
        router.replace("/notification");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch app info";
      setError(errorMessage);
      console.error("[useAppInfoStore] Error checking app status:", err);
      set({
        hasFailedCheck: true,
        lastError: errorMessage,
      });
    } finally {
      setLoading(false);
      set({ isCheckingStatus: false });
    }
  },

  resetFailedState: () => {
    set({
      hasFailedCheck: false,
      lastError: null,
    });
  },
}));

export default useAppInfoStore;
