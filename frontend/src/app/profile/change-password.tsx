import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import auth from "@react-native-firebase/auth";
import { SectionTitle, Instruction } from "@components/typography";

const ChangePasswordScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      return;
    }

    if (isPasswordProvider) {
      await updatePassword(currentPassword, newPassword);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <SectionTitle>Change Password</SectionTitle>

      {!isPasswordProvider && (
        <Instruction>
          Password change is only available for email/password accounts.
        </Instruction>
      )}

      {isPasswordProvider && (
        <>
          <CustomTextInput
            placeholder="Current Password"
            value={currentPassword}
            secureTextEntry
            onChangeText={setCurrentPassword}
            placeholderTextColor={colors.placeholder}
          />
          <CustomTextInput
            placeholder="New Password"
            value={newPassword}
            secureTextEntry
            onChangeText={setNewPassword}
            placeholderTextColor={colors.placeholder}
          />
          <CustomTextInput
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            secureTextEntry
            onChangeText={setConfirmNewPassword}
            placeholderTextColor={colors.placeholder}
          />
          <CustomButton
            title="Change Password"
            onPress={handleChangePassword}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default ChangePasswordScreen;
