import React from "react";
import { Platform } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import AppleSignInButton from "@components/auth/AppleSignInButton";

export const SocialAuthButtons: React.FC<{
  onGooglePress: () => void;
  onApplePress: () => void;
  disabled: boolean;
}> = ({ onGooglePress, onApplePress, disabled }) => {
  return (
    <>
      <CustomButton
        onPress={onGooglePress}
        title="Continue with Google"
        icon={require("assets/images/google-logo.png")}
        disabled={disabled}
      />
      {Platform.OS === "ios" && (
        <AppleSignInButton onPress={onApplePress} disabled={disabled} />
      )}
    </>
  );
};
