// src/providers/ErrorBoundaryWithAlert.tsx

import React, { useCallback } from "react";
import { useAlertDialog } from "../hooks/useAlertDialog";
import ErrorBoundary from "./ErrorBoundary"; // Adjust the path as necessary

const ErrorBoundaryWithAlert: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showError } = useAlertDialog();

  const handleError = useCallback(
    (message: string) => {
      showError(message);
    },
    [showError]
  );

  return <ErrorBoundary showError={handleError}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWithAlert;
