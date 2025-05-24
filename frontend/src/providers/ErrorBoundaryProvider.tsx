import React from 'react';
import ErrorBoundary from '@components/error/ErrorBoundary';
import { useAlertActions } from '@stores/useAlertStore';

/**
 * Provider component that wraps the app with an error boundary
 * and connects it to the alert system for error notifications.
 */
const ErrorBoundaryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showError } = useAlertActions();
  return <ErrorBoundary showError={showError}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryProvider;
