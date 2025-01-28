import React, { useState, useEffect } from "react";
import { ViewStyle } from "react-native";
import { useIsLoading } from "@stores/useUIStore";
import { useTheme, ActivityIndicator, Portal, Modal } from "react-native-paper";

interface LoadingIndicatorProps {
  modal?: boolean;
  style?: ViewStyle;
  size?: "small" | "large";
  minimumDisplayTime?: number;
  color?: string;
  useTheme?: boolean;
}
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  modal = true,
  style,
  size = "large",
  minimumDisplayTime = 200,
  color,
}) => {
  const theme = useTheme();
  const indicatorColor = color || theme.colors.primary;

  const globalIsLoading = useIsLoading();
  const [showLoading, setShowLoading] = useState(false);
  const [delayedIsLoading, setDelayedIsLoading] = useState(false);

  useEffect(() => {
    if (!modal) return;

    let timer: ReturnType<typeof setTimeout>;

    if (globalIsLoading) {
      setDelayedIsLoading(true);
    } else if (delayedIsLoading) {
      timer = setTimeout(() => {
        setDelayedIsLoading(false);
      }, minimumDisplayTime);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [globalIsLoading, delayedIsLoading, modal, minimumDisplayTime]);

  useEffect(() => {
    setShowLoading(delayedIsLoading);
  }, [delayedIsLoading]);

  if (!modal) {
    return (
      <ActivityIndicator
        size={size}
        color={indicatorColor}
        style={style}
        accessibilityLabel="Loading content"
      />
    );
  }

  return (
    <Portal>
      <Modal visible={showLoading} dismissable={false}>
        <ActivityIndicator
          size="large"
          color={indicatorColor}
          animating={showLoading}
          accessibilityLabel="Loading content"
        />
      </Modal>
    </Portal>
  );
};

export default LoadingIndicator;
