import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import { Form, FormField } from "@components/forms/Form";
import { FORM_RULES } from "@utils/formValidation";

const changePasswordFields: FormField[] = [
  {
    name: "currentPassword",
    label: "Current Password",
    type: "password",
    rules: { required: "Current password is required" },
  },
  {
    name: "newPassword",
    label: "New Password",
    type: "password",
    rules: {
      ...FORM_RULES.password,
      validate: (value: string, formValues: Record<string, string>) =>
        value !== formValues.currentPassword ||
        "New password must be different from current password",
    },
  },
  {
    name: "confirmPassword",
    label: "Confirm New Password",
    type: "password",
    rules: {
      required: "Please confirm your new password",
      validate: (value: string, formValues: Record<string, string>) =>
        value === formValues.newPassword || "Passwords don't match",
    },
  },
];

const ChangePasswordScreen: React.FC = () => {
  const loading = useAppSelector(selectIsLoading);
  const { updatePassword } = useAuth();

  useEffect(() => {
    crashlytics().log("Change password screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Change Password</SectionTitle>

      <Form
        fields={changePasswordFields}
        onSubmit={({ currentPassword, newPassword }) =>
          updatePassword(currentPassword, newPassword)
        }
        submitButtonText="Change Password"
        isLoading={loading}
        mode="onChange"
      />
    </ScrollView>
  );
};

export default ChangePasswordScreen;
