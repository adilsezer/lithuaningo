import React from "react";
import { Platform } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import AppleSignInButton from "@components/auth/AppleSignInButton";
import { useThemeStyles } from "@hooks/useThemeStyles";

export const SocialAuthButtons: React.FC<{
  onGooglePress: () => void;
  onApplePress: () => void;
  disabled: boolean;
}> = ({ onGooglePress, onApplePress, disabled }) => {
  const { colors } = useThemeStyles();

  return (
    <>
      <CustomButton
        onPress={onGooglePress}
        title="Continue with Google"
        icon={require("assets/images/google-logo.png")}
        style={{ backgroundColor: colors.card, paddingVertical: 18 }}
        textStyle={{ color: colors.cardText }}
        disabled={disabled}
      />
      {Platform.OS === "ios" && (
        <AppleSignInButton onPress={onApplePress} disabled={disabled} />
      )}
    </>
  );
};
