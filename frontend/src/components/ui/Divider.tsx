import { ReactNode } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { SectionText } from "@components/typography";

interface DividerProps {
  content?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Divider({ content, style }: DividerProps) {
  const { colors, layout } = useThemeStyles();

  return (
    <View style={[layout.center, styles.separator, style]}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      {content && (
        <SectionText style={styles.dividerText}>{content}</SectionText>
      )}
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  separator: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 10,
  },
  dividerText: {
    width: 50,
    textAlign: "center",
  },
  line: {
    flex: 1,
    height: 1,
  },
});
