import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle, Instruction } from "@components/typography";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import auth from "@react-native-firebase/auth";
import { AlertDialog } from "@components/ui/AlertDialog";

const deleteAccountFields: FormField[] = [
  {
    name: "password",
    label: "Current Password",
    type: "password",
    rules: { required: "Please enter your password to confirm deletion" },
    placeholder: "Password",
  },
];

const DeleteAccountScreen: React.FC = () => {
  const loading = useAppSelector(selectIsLoading);
  const { deleteAccount } = useAuth();
  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleDeleteAccount = async (values: { password: string }) => {
    AlertDialog.confirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete your account? This action cannot be undone.",
      confirmText: "Delete",
      confirmStyle: "destructive",
      onConfirm: async () => {
        try {
          await deleteAccount(values.password);
        } catch (error) {
          AlertDialog.error(
            error instanceof Error ? error.message : "Failed to delete account"
          );
        }
      },
    });
  };

  useEffect(() => {
    crashlytics().log("Delete account screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Delete Account</SectionTitle>
      <Instruction>
        This action cannot be undone. All your data will be permanently deleted.
      </Instruction>

      {isPasswordProvider ? (
        <Form
          fields={deleteAccountFields}
          onSubmit={handleDeleteAccount}
          submitButtonText="Delete Account"
          isLoading={loading}
          options={{ mode: "onBlur" }}
        />
      ) : (
        <Instruction>
          Account deletion is only available for email/password accounts.
        </Instruction>
      )}
    </ScrollView>
  );
};

export default DeleteAccountScreen;
