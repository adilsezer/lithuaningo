import React from "react";
import { Image, Text, StyleSheet, ScrollView, View } from "react-native";
import CustomButton from "@components/CustomButton";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";
import { FontAwesome5 } from "@expo/vector-icons";
import { usePurchaseExtraContent } from "@hooks/useUserStatus";

const UnlimitedLearningScreen = () => {
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
      <View style={styles.buttonContainer}>
        <CustomButton
          title={isPurchasing ? "Processing..." : "Unlock Now"}
          onPress={purchaseExtraContent}
          disabled={isPurchasing}
          style={[
            styles.unlockButton,
            { backgroundColor: globalColors.secondary },
          ]}
          icon={
            <FontAwesome5
              name="unlock-alt"
              size={20}
              color={globalColors.buttonText}
            />
          }
        />
      </View>
      <View
        style={[
          styles.horizontalRule,
          { borderBottomColor: globalColors.secondary },
        ]}
      />
      <Text style={globalStyles.title}>Unlimited Learning Upgrade</Text>

      <Text style={[globalStyles.subtitle, { textAlign: "justify" }]}>
        Remove the daily limit of 2 sentences with our Unlimited Learning
        Upgrade. This in-app purchase gives you unlimited access to all word and
        sentence exercises, allowing you to practice as much as you need.
      </Text>

      <Text style={globalStyles.subheading}>What You'll Get:</Text>
      <Text style={[globalStyles.subtitle, styles.bullet]}>
        • <Text style={globalStyles.subheading}>Unlimited Exercises:</Text>{" "}
        Access all word and sentence exercises without any daily restrictions.
      </Text>
      <Text style={[globalStyles.subtitle, styles.bullet]}>
        • <Text style={globalStyles.subheading}>New Practice Sets:</Text>{" "}
        Generate new words and sentences whenever you want, allowing you to
        continually explore and learn fresh vocabulary.
      </Text>

      <Text style={globalStyles.subheading}>Upgrade Now</Text>
      <Text style={[globalStyles.subtitle, { textAlign: "justify" }]}>
        Unlock unlimited access to boost your Lithuanian practice. Tap the
        button above to upgrade now.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: 300,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
  },
  bullet: {
    marginBottom: 10, // Add margin between bullet points
    textAlign: "justify",
  },
  buttonContainer: {
    marginBottom: 10, // Add some space after the button
  },
  unlockButton: {
    width: "80%", // Adjust button width
  },
  horizontalRule: {
    width: "80%",
    alignSelf: "center",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
});

export default UnlimitedLearningScreen;
