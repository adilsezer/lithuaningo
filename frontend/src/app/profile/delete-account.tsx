import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { deleteAccountFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { supabase } from "@services/supabase/supabaseClient";

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
  const { showConfirm, showError } = useAlertDialog();

  const handleDeleteAccount = async (values: { password: string }) => {
    showConfirm({
      title: "Confirm Deletion",
      message:
        "Are you sure you want to delete your account? This action cannot be undone.",
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
      <CustomText>Delete Account</CustomText>
      <CustomText>
        This action cannot be undone. All your data will be permanently deleted.
      </CustomText>

      <Form
        fields={deleteAccountFields}
        onSubmit={handleDeleteAccount}
        submitButtonText="Delete Account"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        zodSchema={deleteAccountFormSchema}
      />
    </ScrollView>
  );
};

export default DeleteAccountScreen;
