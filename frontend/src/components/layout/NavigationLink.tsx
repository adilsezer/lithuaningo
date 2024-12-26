import React from "react";
import { Text, TouchableOpacity, StyleSheet, TextStyle } from "react-native";
import { router } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";

interface NavigationLinkProps {
  text: string;
  path: string;
  style?: TextStyle;
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
      <Text
        style={[
          globalStyles.text,
          { color: globalColors.link },
          styles.link,
          style,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    marginVertical: 10,
  },
});

export default NavigationLink;
