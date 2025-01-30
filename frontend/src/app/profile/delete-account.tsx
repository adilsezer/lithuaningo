import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import crashlytics from "@react-native-firebase/crashlytics";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { deleteAccountFormSchema } from "@utils/zodSchemas";
import auth from "@react-native-firebase/auth";
import CustomText from "@components/ui/CustomText";
import { useAlertDialog } from "@hooks/useAlertDialog";
const deleteAccountFields: FormField[] = [
  {
    name: "password",
    label: "Current Password",
    category: "text-input",
    type: "password",
    placeholder: "Password",
  },
];

const DeleteAccountScreen: React.FC = () => {
  const loading = useIsLoading();
  const { deleteAccount } = useAuth();
  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );
  const { showConfirm, showError } = useAlertDialog();

  useEffect(() => {
    crashlytics().log("Delete account screen loaded.");
  }, []);

  const handleDeleteAccount = async (values: { password: string }) => {
    showConfirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete your account? This action cannot be undone.",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          await deleteAccount(values.password);
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
      <CustomText>Delete Account</CustomText>
      <CustomText>
        This action cannot be undone. All your data will be permanently deleted.
      </CustomText>

      {isPasswordProvider ? (
        <Form
          fields={deleteAccountFields}
          onSubmit={handleDeleteAccount}
          submitButtonText="Delete Account"
          isLoading={loading}
          options={{ mode: "onBlur" }}
          zodSchema={deleteAccountFormSchema}
        />
      ) : (
        <CustomText>
          Account deletion is only available for email/password accounts.
        </CustomText>
      )}
    </ScrollView>
  );
};

export default DeleteAccountScreen;
