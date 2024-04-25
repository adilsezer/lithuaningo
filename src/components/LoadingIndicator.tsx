import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";
import { useAppSelector } from "@src/redux/hooks";
import { selectIsLoading } from "@src/redux/slices/uiSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const LoadingIndicator = () => {
  const { colors: globalColors } = useThemeStyles();
  const isLoading = useAppSelector(selectIsLoading);

  const dynamicActivityIndicatorStyle = {
    backgroundColor: globalColors.background,
    color: globalColors.active,
  };

  return (
    <Modal
      transparent={true}
      animationType="none"
      visible={isLoading}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <View
          style={[
            styles.activityIndicatorWrapper,
            dynamicActivityIndicatorStyle,
          ]}
        >
          <ActivityIndicator
            size="large"
            color={globalColors.active}
            animating={isLoading}
            accessibilityLabel="Loading content"
          />
        </View>
      </View>
    </Modal>
  );
};

export default LoadingIndicator;

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
