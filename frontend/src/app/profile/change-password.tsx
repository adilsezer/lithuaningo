import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import auth from "@react-native-firebase/auth";
import { SectionTitle, Instruction } from "@components/typography";
import { AlertDialog } from "@components/ui/AlertDialog";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePasswordScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const { updatePassword } = useAuth();
  const [form, setForm] = React.useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const updateFormField = (field: keyof PasswordForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmNewPassword
    ) {
      AlertDialog.error("All fields are required");
      return false;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      AlertDialog.error("New passwords don't match");
      return false;
    }
    if (form.newPassword.length < 6) {
      AlertDialog.error("New password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updatePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      AlertDialog.success("Password updated successfully");
    } catch (err) {
      AlertDialog.error(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordForm = () => (
    <>
      <CustomTextInput
        placeholder="Current Password"
        value={form.currentPassword}
        secureTextEntry
        onChangeText={updateFormField("currentPassword")}
        placeholderTextColor={colors.placeholder}
      />
      <CustomTextInput
        placeholder="New Password"
        value={form.newPassword}
        secureTextEntry
        onChangeText={updateFormField("newPassword")}
        placeholderTextColor={colors.placeholder}
      />
      <CustomTextInput
        placeholder="Confirm New Password"
        value={form.confirmNewPassword}
        secureTextEntry
        onChangeText={updateFormField("confirmNewPassword")}
        placeholderTextColor={colors.placeholder}
      />
      <CustomButton
        title="Change Password"
        onPress={handleChangePassword}
        disabled={isLoading}
      />
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <SectionTitle>Change Password</SectionTitle>

      {!isPasswordProvider ? (
        <Instruction>
          Password change is only available for email/password accounts.
        </Instruction>
      ) : (
        renderPasswordForm()
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
