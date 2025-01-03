import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import { useThemeStyles } from "@hooks/useThemeStyles";

const LoadingIndicator = () => {
  const { colors: globalColors } = useThemeStyles();
  const isLoading = useAppSelector(selectIsLoading);
  const [showLoading, setShowLoading] = useState(false);
  const [delayedIsLoading, setDelayedIsLoading] = useState(false);
  const minimumDisplayTime = 200;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isLoading) {
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
  }, [isLoading, delayedIsLoading]);

  useEffect(() => {
    if (delayedIsLoading) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [delayedIsLoading]);

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
            { backgroundColor: globalColors.background },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={globalColors.active}
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
});

export default LoadingIndicator;
