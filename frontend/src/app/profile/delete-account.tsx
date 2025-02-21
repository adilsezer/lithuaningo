import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { deleteAccountFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useUserData } from "@stores/useUserStore";

const getDeleteAccountFields = (authProvider: string): FormField[] => {
  // Only show password field for email/password users
  if (authProvider === "email") {
    return [
      {
        name: "password",
        label: "Current Password",
        category: "text-input",
        type: "password",
        placeholder: "Password",
      },
    ];
  }
  return [];
};

const DeleteAccountScreen: React.FC = () => {
  const loading = useIsLoading();
  const { deleteAccount } = useAuth();
  const { showConfirm, showError } = useAlertDialog();
  const userData = useUserData();

  if (!userData) return null;

  const handleDeleteAccount = async (values: { password?: string }) => {
    showConfirm({
      title: "Confirm Deletion",
      message:
        userData.authProvider === "email"
          ? "Are you sure you want to delete your account? This action cannot be undone."
          : `You'll need to verify your ${userData.authProvider} account before deletion. Are you sure you want to proceed?`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteAccount();
        } catch (error) {
          showError(
            error instanceof Error ? error.message : "Failed to delete account"
          );
        }
      },
    });
  };

  return (
    <ScrollView>
      <BackButton />
      <View style={styles.container}>
        <CustomText variant="titleLarge" bold>
          Delete Account
        </CustomText>

        <CustomText variant="bodyLarge" style={styles.warning}>
          This action cannot be undone. All your data will be permanently
          deleted.
        </CustomText>

        {userData.authProvider === "email" ? (
          <CustomText variant="bodyMedium">
            Please enter your password to confirm account deletion.
          </CustomText>
        ) : (
          <CustomText variant="bodyMedium">
            You are signed in with {userData.authProvider}. You will need to
            verify your {userData.authProvider} account before deletion. Click
            delete to proceed.
          </CustomText>
        )}

        <Form
          fields={getDeleteAccountFields(userData.authProvider)}
          onSubmit={handleDeleteAccount}
          submitButtonText="Delete Account"
          isLoading={loading}
          options={{ mode: "onBlur" }}
          zodSchema={deleteAccountFormSchema}
          submitButtonStyle={styles.deleteButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  warning: {
    color: "red",
  },
  deleteButton: {
    marginTop: 24,
  },
});

export default DeleteAccountScreen;
