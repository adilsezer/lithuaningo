import React from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useIsLoading } from "@stores/useUIStore";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { editProfileFormSchema } from "@utils/zodSchemas";
import { useRouter } from "expo-router";
import { useUserData } from "@stores/useUserStore";
const getEditProfileFields = (
  authProvider: string,
  displayName: string
): FormField[] => {
  const fields: FormField[] = [
    {
      name: "displayName",
      label: "Display Name",
      category: "text-input",
      type: "text",
      placeholder: "Display Name",
      defaultValue: displayName,
    },
  ];

  // Only add password field for email/password users
  if (authProvider === "email") {
    fields.push({
      name: "currentPassword",
      label: "Current Password",
      category: "text-input",
      type: "password",
      placeholder: "Password",
    });
  }

  return fields;
};

const EditProfileScreen: React.FC = () => {
  const loading = useIsLoading();
  const { updateProfile } = useAuth();
  const router = useRouter();
  const userData = useUserData();

  if (!userData) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <ScrollView>
      <Form
        fields={getEditProfileFields(userData.authProvider, userData.fullName)}
        onSubmit={async (data) => {
          await updateProfile(data.currentPassword ?? "", {
            displayName: data.displayName,
          });
        }}
        submitButtonText="Save Changes"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        zodSchema={editProfileFormSchema}
        defaultValues={{
          authProvider: userData.authProvider,
          displayName: userData.fullName,
        }}
      />
    </ScrollView>
  );
};

export default EditProfileScreen;
