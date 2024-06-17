// src/components/CompletedScreen.tsx
import React from "react";
import { ScrollView, Text } from "react-native";
import CustomButton from "./CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useRouter } from "expo-router";

interface CompletedScreenProps {
  displayText: string;
  buttonText: string;
  navigationRoute: string;
}

const CompletedScreen: React.FC<CompletedScreenProps> = ({
  displayText,
  buttonText,
  navigationRoute,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const router = useRouter();

  return (
    <ScrollView>
      <Text style={[globalStyles.title, { marginTop: 40 }]}>{displayText}</Text>
      <CustomButton
        title={buttonText}
        onPress={() => router.push(navigationRoute)}
        style={{
          backgroundColor: globalColors.secondary,
        }}
      />
    </ScrollView>
  );
};

export default CompletedScreen;
