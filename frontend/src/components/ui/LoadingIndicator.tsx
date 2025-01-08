import React, { useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ViewStyle,
} from "react-native";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface LoadingIndicatorProps {
  // If true, shows as modal overlay. If false, shows inline
  modal?: boolean;
  // For inline mode only
  style?: ViewStyle;
  // For inline mode only
  size?: "small" | "large";
  // Optional minimum display time in ms (for modal only)
  minimumDisplayTime?: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  modal = true,
  style,
  size = "large",
  minimumDisplayTime = 200,
}) => {
  const { colors } = useThemeStyles();
  const globalIsLoading = useAppSelector(selectIsLoading);
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
    if (delayedIsLoading) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [delayedIsLoading]);

  if (!modal) {
    return (
      <View style={[styles.inlineContainer, style]}>
        <ActivityIndicator
          size={size}
          color={colors.active}
          accessibilityLabel="Loading content"
        />
      </View>
    );
  }

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={showLoading}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <View
          style={[
            styles.activityIndicatorWrapper,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={colors.active}
            animating={showLoading}
            accessibilityLabel="Loading content"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  activityIndicatorWrapper: {
    height: 100,
    width: 100,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingIndicator;
