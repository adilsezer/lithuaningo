import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
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
    type: "text",
    rules: FORM_RULES.name,
    defaultValue: user?.displayName || "",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    rules: FORM_RULES.email,
    defaultValue: user?.email || "",
  },
  {
    name: "currentPassword",
    label: "Current Password",
    type: "password",
    rules: { required: "Current password is required" },
  },
];

const EditProfileScreen: React.FC = () => {
  const loading = useAppSelector(selectIsLoading);
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
