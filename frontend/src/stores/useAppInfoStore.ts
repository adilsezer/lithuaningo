import { create } from "zustand";
import { router } from "expo-router";
import {
  getLatestAppInfo,
  getCurrentVersion,
} from "@services/data/appInfoService";
import type { AppInfo } from "@src/types";

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

const useAppInfoStore = create<AppInfoState & AppInfoActions>((set, get) => ({
  appInfo: null,
  loading: true,
  error: null,
  isUnderMaintenance: false,
  needsUpdate: false,

  checkAppStatus: async () => {
    try {
      const latestAppInfo = await getLatestAppInfo();
      const needsUpdate =
        latestAppInfo?.latestVersion !== currentVersion &&
        latestAppInfo?.mandatoryUpdate;

      set({
        appInfo: latestAppInfo,
        isUnderMaintenance: latestAppInfo?.isUnderMaintenance ?? false,
        needsUpdate,
        error: null,
      });

      if (latestAppInfo && (needsUpdate || latestAppInfo.isUnderMaintenance)) {
        router.replace("/notification");
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch app info",
      });
      console.error("Error fetching app info:", err);
    } finally {
      set({ loading: false });
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
