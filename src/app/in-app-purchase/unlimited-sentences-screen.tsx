import React from "react";
import { Image, Text, StyleSheet, ScrollView } from "react-native";
import CustomButton from "@components/CustomButton"; // Adjust the import path as needed
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";
import { FontAwesome5 } from "@expo/vector-icons";
import { usePurchaseExtraContent } from "@hooks/useUserStatus"; // Import the hook

const UnlimitedSentencesScreen = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);

  const { purchaseExtraContent, isPurchasing } = usePurchaseExtraContent(
    userData?.id || ""
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <Image
        source={require("assets/images/unlock_sentences.jpeg")}
        style={styles.image}
      />
      <Text style={globalStyles.title}>Unlimited Challenge Access</Text>
      <Text style={[globalStyles.subtitle, { textAlign: "justify" }]}>
        This in-app purchase unlocks unlimited access to word and sentence
        exercises, allowing you to study without the daily limit of 2 sentences.
        Unlock your full potential and accelerate your language learning
        journey!
      </Text>

      <Text style={globalStyles.subheading}>Why Upgrade?</Text>
      <Text style={[globalStyles.subtitle, { textAlign: "left" }]}>
        • Unlimited access to all exercises{"\n"}• No daily sentence limit{"\n"}
        • Improve faster by practicing more{"\n"}
      </Text>

      <CustomButton
        title={isPurchasing ? "Processing..." : "Unlock Unlimited Challenges"}
        onPress={purchaseExtraContent}
        disabled={isPurchasing}
        style={{ backgroundColor: globalColors.secondary }}
        icon={
          <FontAwesome5
            name="unlock-alt"
            size={20}
            color={globalColors.buttonText}
          />
        } // Pass the FontAwesome icon as a propv
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: 300, // Adjust the height as needed
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
  },
});

export default UnlimitedSentencesScreen;
