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

  // Determine if the device is a tablet
  const isTablet =
    (Platform.OS === "ios" && Platform.isPad) || screenWidth >= 768;

  // Determine the default width for iPad
  const defaultWidth = isTablet ? "50%" : "75%";

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={10} // Match custom button borderRadius
        style={[globalStyles.button, { width: defaultWidth, height: 55 }]}
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
  disabled: {
    opacity: 0.5,
  },
});

export default AppleSignInButton;
