import React from "react";
import { TouchableOpacity, StyleSheet, TextStyle } from "react-native";
import { router } from "expo-router";
import { LinkText } from "@components/typography";
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
  const handlePress = () => {
    router.push(path);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <LinkText style={[styles.link, style]}>{text}</LinkText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    marginVertical: 10,
  },
});

export default NavigationLink;
