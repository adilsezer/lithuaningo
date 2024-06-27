import React from "react";
import { StyleSheet, View, useWindowDimensions, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface AppleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onPress,
  disabled,
}) => {
  const { styles: globalStyles } = useThemeStyles();
  const { width: screenWidth } = useWindowDimensions();

  // Determine the default width for iPad
  const defaultWidth =
    Platform.OS === "ios" && screenWidth >= 768 && screenWidth <= 1024
      ? "50%"
      : "75%";

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={10} // Match custom button borderRadius
        style={[globalStyles.button, styles.button, { width: defaultWidth }]}
        onPress={disabled ? () => {} : onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: 55,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AppleSignInButton;
