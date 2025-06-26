import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { deleteAccountFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { useUserData } from "@stores/useUserStore";
const getDeleteAccountFields = (authProvider: string): FormField[] => {
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
  const userData = useUserData();

  if (!userData) {
    return null;
  }

  const handleSubmit = async (values: { password?: string }) => {
    await deleteAccount(values.password, userData.authProvider);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <CustomText variant="bodyLarge" style={styles.warning}>
          This action cannot be undone. All your data will be permanently
          deleted.
        </CustomText>

        <CustomText variant="bodyMedium">
          {userData.authProvider === "email"
            ? "Please enter your password to confirm account deletion."
            : `You are signed in with ${userData.authProvider}. You will need to verify your ${userData.authProvider} account before deletion. Click delete to proceed.`}
        </CustomText>

        <Form
          fields={getDeleteAccountFields(userData.authProvider)}
          onSubmit={handleSubmit}
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
