import React from "react";
import { Dimensions, Platform } from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

// Map route prefixes to their corresponding tab destinations
const TAB_ROUTES = {
  "/decks/": "/dashboard/(tabs)/decks",
  "/learning/": "/dashboard/(tabs)/challenge",
  "/profile/": "/dashboard/(tabs)/profile",
  "/leaderboard/": "/dashboard/(tabs)/leaderboard",
  "/about/": "/dashboard/(tabs)/index",
  "/flashcards/": "/dashboard/(tabs)/decks",
} as const;

const BackButton: React.FC = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const iconSize = isTablet ? 36 : 24;

  const handleBack = () => {
    // Find the matching tab route based on the current pathname
    const matchingPrefix = Object.keys(TAB_ROUTES).find((prefix) =>
      pathname.startsWith(prefix)
    );

    if (matchingPrefix) {
      router.replace(TAB_ROUTES[matchingPrefix as keyof typeof TAB_ROUTES]);
    } else {
      router.back();
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
