import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { changePasswordFormSchema } from "@utils/zodSchemas";

const changePasswordFields: FormField[] = [
  {
    name: "currentPassword",
    label: "Current Password",
    category: "text-input",
    type: "password",
    placeholder: "Current Password",
  },
  {
    name: "newPassword",
    label: "New Password",
    category: "text-input",
    type: "password",
    placeholder: "New Password",
  },
  {
    name: "confirmPassword",
    label: "Confirm New Password",
    category: "text-input",
    type: "password",
    placeholder: "Confirm New Password",
  },
];

const ChangePasswordScreen: React.FC = () => {
  const loading = useIsLoading();
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
        zodSchema={changePasswordFormSchema}
      />
    </ScrollView>
  );
};

export default ChangePasswordScreen;
