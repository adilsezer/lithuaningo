import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useTheme } from "react-native-paper";
interface AppleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const styles = (isTablet: boolean) =>
  StyleSheet.create({
    disabled: {
      opacity: 0.5,
    },
    iosButtonContainer: {
      alignItems: "center",
      backgroundColor: "black",
      borderRadius: 10,
      height: 60,
      alignSelf: "center",
      justifyContent: "center",
      marginVertical: isTablet ? 15 : 10,
      width: isTablet ? "50%" : "75%",
    },
  });

const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  onPress,
  disabled,
}) => {
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;
  const componentStyles = styles(isTablet);

  return (
    <View
      style={[
        componentStyles.iosButtonContainer,
        disabled && componentStyles.disabled,
      ]}
    >
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        onPress={disabled ? () => {} : onPress}
        style={[
          { width: "100%", paddingVertical: 22 },
          isTablet && { height: 65 },
        ]}
      />
    </View>
  );
};

export default AppleSignInButton;
