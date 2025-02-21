import React from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/ui/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { changePasswordFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { useUserData } from "@stores/useUserStore";

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
  const userData = useUserData();

  if (userData?.authProvider !== "email") {
    return (
      <ScrollView>
        <BackButton />
        <CustomText>
          Password change is only available for email/password accounts. You are
          signed in with {userData?.authProvider}.
        </CustomText>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <BackButton />
      <CustomText>Change Password</CustomText>

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
