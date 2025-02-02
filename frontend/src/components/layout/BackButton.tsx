import React from "react";
import { Dimensions, Platform } from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation, usePathname } from "expo-router";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

const BackButton: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const pathname = usePathname();
  const iconSize = isTablet ? 36 : 24;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If we're already in the dashboard tabs, don't navigate
      if (!pathname.startsWith("/dashboard")) {
        router.push("/dashboard");
      }
    }
  };

  return (
    <IconButton
      icon={({ size, color }) => (
        <Ionicons
          name="arrow-back"
          size={iconSize}
          color={theme.colors.onBackground}
        />
      )}
      onPress={handleBack}
      style={{ margin: 10 }}
      size={iconSize}
      animated
    />
  );
};

export default BackButton;
