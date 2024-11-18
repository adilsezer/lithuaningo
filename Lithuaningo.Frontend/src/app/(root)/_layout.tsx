import React, { useEffect } from "react";
import { Redirect, router, Slot } from "expo-router";
import { useAppSelector } from "../../redux/hooks";
import { selectIsAuthenticated } from "@src/redux/slices/userSlice";
import {
  getLatestAppInfo,
  getCurrentVersion,
} from "../../services/data/appInfoService";

const AppLayout: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const checkAppInfo = async () => {
      const latestAppInfo = await getLatestAppInfo();
      const currentVersion = getCurrentVersion();

      if (latestAppInfo) {
        const needsMaintenance = latestAppInfo.isUnderMaintenance;
        const needsUpdate =
          latestAppInfo.latestVersion !== currentVersion &&
          latestAppInfo.mandatoryUpdate;

        if (needsMaintenance || needsUpdate) {
          router.push("/notification");
        }
      }
    };

    checkAppInfo();
  }, []);

  if (isAuthenticated) {
    return <Redirect href="/dashboard/(tabs)" />;
  }

  return <Slot />;
};

export default AppLayout;
