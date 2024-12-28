import React from "react";
import { View, StyleSheet, Image } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { SectionTitle, Subtitle } from "@components/typography";

interface NotificationDisplayProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonAction?: () => void;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  title,
  subtitle,
  buttonText,
  buttonAction,
}) => {
  return (
    <View style={styles.container}>
      <Image source={require("assets/images/icon.png")} style={styles.logo} />
      <SectionTitle>{title}</SectionTitle>
      <Subtitle>{subtitle}</Subtitle>
      {buttonText && buttonAction && (
        <CustomButton onPress={buttonAction} title={buttonText} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
});

export default NotificationDisplay;
