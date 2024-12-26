import React, { useEffect } from "react";
import { Redirect, router, Slot } from "expo-router";
import { useAppSelector } from "@redux/hooks";
import { selectIsAuthenticated } from "@redux/slices/userSlice";
import { useAppVersionCheck } from "@hooks/useAppVersionCheck";

const AppLayout: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const checkAppVersion = useAppVersionCheck();

  useEffect(() => {
    checkAppVersion();
  }, []);

  if (isAuthenticated) {
    return <Redirect href="/dashboard/(tabs)" />;
  }

  return <Slot />;
};

export default AppLayout;
