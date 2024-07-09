import React, { useEffect } from "react";
import { Redirect, router, Slot } from "expo-router";
import { useAppSelector } from "../../redux/hooks";
import { selectIsAuthenticated } from "@src/redux/slices/userSlice";
import {
  getLatestVersionInfo,
  getCurrentVersion,
} from "../../services/data/versionService";

const AppLayout: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const checkVersion = async () => {
      const latestVersionData = await getLatestVersionInfo();
      const currentVersion = getCurrentVersion();

      if (
        latestVersionData &&
        latestVersionData.latestVersion !== currentVersion
      ) {
        if (latestVersionData.mandatoryUpdate) {
          router.push("/update");
        }
      }
    };

    checkVersion();
  }, []);

  if (isAuthenticated) {
    return <Redirect href="/dashboard/(tabs)" />;
  }

  return <Slot />;
};

export default AppLayout;
