import React from "react";
import {
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useTheme } from "react-native-paper";
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
    <TouchableOpacity
      onPress={handleBack}
      style={styles.button}
      activeOpacity={0.6}
    >
      <Ionicons
        name="arrow-back"
        size={iconSize}
        color={theme.colors.onBackground}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    margin: 10,
    minWidth: 50,
    minHeight: 30,
  },
});

export default BackButton;
