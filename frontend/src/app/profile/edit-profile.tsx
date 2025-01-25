import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { FORM_RULES } from "@utils/formValidation";
import auth from "@react-native-firebase/auth";

const getEditProfileFields = (
  user: ReturnType<typeof auth>["currentUser"]
): FormField[] => [
  {
    name: "displayName",
    label: "Display Name",
    category: "text-input",
    type: "text",
    placeholder: "Display Name",
    validation: FORM_RULES.name,
  },
  {
    name: "currentPassword",
    label: "Current Password",
    category: "text-input",
    type: "password",
    placeholder: "Password",
    validation: {
      required: true,
      message: "Current password is required",
    },
  },
];

const EditProfileScreen: React.FC = () => {
  const loading = useIsLoading();
  const { updateProfile } = useAuth();
  const user = auth().currentUser;

  useEffect(() => {
    crashlytics().log("Edit profile screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Edit Profile</SectionTitle>

      <Form
        fields={getEditProfileFields(user)}
        onSubmit={async (data) => {
          await updateProfile(data.currentPassword, {
            displayName: data.displayName,
            email: data.email,
          });
        }}
        submitButtonText="Save Changes"
        isLoading={loading}
        options={{ mode: "onBlur" }}
      />
    </ScrollView>
  );
};

export default EditProfileScreen;
