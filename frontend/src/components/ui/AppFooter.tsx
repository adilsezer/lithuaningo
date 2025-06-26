import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { getCurrentVersion } from "@services/data/appInfoService";
import CustomText from "./CustomText";

interface AppFooterProps {
  style?: StyleProp<ViewStyle>;
}

export const AppFooter: React.FC<AppFooterProps> = ({ style }) => {
  const theme = useTheme();
  const currentVersion = getCurrentVersion();
  const currentYear = new Date().getFullYear();

  return (
    <View style={[styles.container, style]}>
      {/* Made with love message */}
      <CustomText
        variant="bodySmall"
        style={[styles.madeWithLove, { color: theme.colors.onSurfaceVariant }]}
      >
        Made with ❤️ for Lithuanian learners
      </CustomText>

      {/* Copyright and version */}
      <CustomText
        variant="bodySmall"
        style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}
      >
        © {currentYear} Lithuaningo • v{currentVersion}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 4,
  },
  madeWithLove: {
    textAlign: "center",
    fontStyle: "italic",
  },
  copyright: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 12,
  },
});

export default AppFooter;
