import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { View, Text } from "react-native";

export default function OrSeperator() {
  const { styles: globalStyles } = useThemeStyles();

  return (
    <View style={globalStyles.separator}>
      <View style={globalStyles.line} />
      <Text style={globalStyles.orText}>Or</Text>
      <View style={globalStyles.line} />
    </View>
  );
}
