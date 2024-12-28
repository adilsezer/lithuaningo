import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import CustomTextInput from "@components/ui/CustomTextInput";
import BackButton from "@components/layout/BackButton";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import auth from "@react-native-firebase/auth";
import { SectionTitle, Paragraph } from "@components/typography";

const DeleteAccountScreen: React.FC = () => {
  const [password, setPassword] = useState("");
  const { deleteAccount } = useAuth();
  const { colors } = useThemeStyles();

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleDelete = async () => {
    await deleteAccount(isPasswordProvider ? password : undefined);
  };

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <SectionTitle>Delete Account</SectionTitle>

      <Paragraph>
        Deleting your account is a permanent action and cannot be undone. All
        your data will be lost.
        {isPasswordProvider &&
          " To proceed, please enter your password below to confirm your identity and delete your account."}
      </Paragraph>

      {isPasswordProvider && (
        <CustomTextInput
          secureTextEntry
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.placeholder}
        />
      )}

      <CustomButton
        title="Delete Account"
        onPress={handleDelete}
        style={styles.deleteButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    marginTop: 20,
  },
});

export default DeleteAccountScreen;
