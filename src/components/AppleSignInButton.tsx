import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
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
  const { width } = Dimensions.get("window");
  const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

  return (
    <View
      style={[globalStyles.iosButtonContainer, disabled && styles.disabled]}
    >
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        style={[globalStyles.button, { height: isTablet ? 65 : 50 }]}
        onPress={disabled ? () => {} : onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

export default AppleSignInButton;
