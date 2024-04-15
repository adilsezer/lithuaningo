// Import React and necessary components from React Native
import React from "react";
import { Text, TouchableOpacity, StyleSheet, TextStyle } from "react-native";
// Assuming router and useThemeStyles are correctly typed in their respective modules
import { router } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

// Define an interface for the component's props
interface NavigationLinkProps {
  text: string;
  path: string;
  style?: TextStyle; // Using React Native's TextStyle type for styling prop
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  text,
  path,
  style,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const handlePress = () => {
    router.push(path);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={[{ color: globalColors.link }, styles.link, style]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    marginVertical: 10, // Default top margin
  },
});

export default NavigationLink;
