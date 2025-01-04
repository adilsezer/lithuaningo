import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import { Form } from "@components/forms/Form";
import { FORM_RULES } from "@utils/formValidation";

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

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

      <Form<ChangePasswordForm>
        fields={[
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
              validate: (value, formValues) =>
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
              validate: (value, formValues) =>
                value === formValues.newPassword || "Passwords don't match",
            },
          },
        ]}
        onSubmit={async (data) => {
          await updatePassword(data.currentPassword, data.newPassword);
        }}
        submitButtonText="Change Password"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        defaultValues={{
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
      />
    </ScrollView>
  );
};

export default ChangePasswordScreen;
