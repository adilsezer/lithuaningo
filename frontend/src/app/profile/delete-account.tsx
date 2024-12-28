import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAuth } from "@hooks/useAuth";
import auth from "@react-native-firebase/auth";
import BackButton from "@components/layout/BackButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import CustomButton from "@components/ui/CustomButton";
import { SectionTitle, Paragraph } from "@components/typography";
import { AlertDialog } from "@components/ui/AlertDialog";

const DeleteAccountScreen: React.FC = () => {
  const [password, setPassword] = useState("");
  const { colors } = useThemeStyles();
  const { deleteAccount } = useAuth();

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleDelete = () => {
    AlertDialog.confirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete your account? This action cannot be undone.",
      confirmText: "Delete",
      confirmStyle: "destructive",
      onConfirm: async () => {
        if (isPasswordProvider && !password.trim()) {
          AlertDialog.error(
            "Please enter your password to delete your account"
          );
          return;
        }

        await deleteAccount(isPasswordProvider ? password : undefined);
        AlertDialog.success("Your account has been deleted successfully");
      },
    });
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
