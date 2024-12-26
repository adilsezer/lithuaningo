import { useCallback } from "react";
import { router } from "expo-router";
import {
  getLatestAppInfo,
  getCurrentVersion,
} from "@services/data/appInfoService";

export const useAppVersionCheck = () => {
  return useCallback(async () => {
    const latestAppInfo = await getLatestAppInfo();
    const currentVersion = getCurrentVersion();

    if (!latestAppInfo) return;

    const needsUpdate =
      latestAppInfo.latestVersion !== currentVersion &&
      latestAppInfo.mandatoryUpdate;

    if (latestAppInfo.isUnderMaintenance || needsUpdate) {
      router.push("/notification");
    }
  }, []);
};
