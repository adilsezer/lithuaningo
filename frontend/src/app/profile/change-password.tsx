import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import { Form } from "@components/form/Form";
import { FORM_RULES } from "@utils/formValidation";
import type { FormField } from "@components/form/form.types";

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
    rules: FORM_RULES.password,
  },
  {
    name: "confirmPassword",
    label: "Confirm New Password",
    type: "password",
    rules: {
      required: "Please confirm your new password",
      validate: (value, formValues) =>
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
        onSubmit={async (data) => {
          await updatePassword(data.currentPassword, data.newPassword);
        }}
        submitButtonText="Change Password"
        isLoading={loading}
        options={{ mode: "onBlur" }}
      />
    </ScrollView>
  );
};

export default ChangePasswordScreen;
