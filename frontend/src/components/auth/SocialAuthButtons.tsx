import React from "react";
import { Platform, View, StyleSheet, TextStyle } from "react-native";
import { useTheme } from "react-native-paper";
import {
  GoogleSocialButton,
  AppleSocialButton,
} from "react-native-social-buttons";

type SocialAuthMode = "login" | "signup";

export const SocialAuthButtons: React.FC<{
  onGooglePress: () => void;
  onApplePress: () => void;
  mode?: SocialAuthMode;
}> = ({ onGooglePress, onApplePress, mode = "login" }) => {
  const theme = useTheme();

  const buttonStyles = {
    ...styles.button,
    borderColor: theme.colors.onBackground,
  };

  const textStyles: TextStyle = {
    fontFamily: theme.fonts.default.fontFamily,
    fontWeight: "500",
  };

  const getButtonText = (provider: "google" | "apple") => {
    const action = mode === "signup" ? "Sign up" : "Sign in";
    return `${action} with ${provider === "google" ? "Google" : "Apple"}`;
  };

  return (
    <View style={styles.container}>
      <GoogleSocialButton
        onPress={onGooglePress}
        buttonViewStyle={buttonStyles}
        textStyle={textStyles}
        buttonText={getButtonText("google")}
      />
      {Platform.OS === "ios" && (
        <AppleSocialButton
          onPress={onApplePress}
          buttonViewStyle={buttonStyles}
          textStyle={textStyles}
          buttonText={getButtonText("apple")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 12,
    gap: 16,
  },
  button: {
    width: "100%",
    height: 60,
    borderRadius: 8,
    borderWidth: 0.5,
  },
});
