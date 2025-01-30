import React, { useEffect } from "react";
import { useAppInfoActions } from "@stores/useAppInfoStore";

export const AppInfoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { checkAppStatus } = useAppInfoActions();

  useEffect(() => {
    checkAppStatus();
  }, [checkAppStatus]);

  return <>{children}</>;
};

export default AppInfoProvider;
