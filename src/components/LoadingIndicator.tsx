import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { useAppSelector } from "@src/redux/hooks";
import { selectIsLoading } from "@src/redux/slices/uiSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const LoadingIndicator = () => {
  const { colors: globalColors } = useThemeStyles();
  const isLoading = useAppSelector(selectIsLoading);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoading(true);
      }, 500);
    } else {
      setShowLoading(false);
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading]);

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
