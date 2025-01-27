import { ReactNode } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import CustomText from "@components/ui/CustomText";
import { useTheme } from "react-native-paper";

interface DividerProps {
  content?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Divider({ content, style }: DividerProps) {
  const theme = useTheme();

  return (
    <View style={[styles.separator, style]}>
      <View style={[styles.line, { backgroundColor: theme.colors.primary }]} />
      {content && <CustomText style={styles.dividerText}>{content}</CustomText>}
      <View style={[styles.line, { backgroundColor: theme.colors.primary }]} />
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
