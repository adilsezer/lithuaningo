import React, { useEffect } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import crashlytics from "@react-native-firebase/crashlytics";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { editProfileFormSchema } from "@utils/zodSchemas";
import auth from "@react-native-firebase/auth";
import CustomText from "@components/ui/CustomText";

const getEditProfileFields = (
  user: ReturnType<typeof auth>["currentUser"]
): FormField[] => [
  {
    name: "displayName",
    label: "Display Name",
    category: "text-input",
    type: "text",
    placeholder: "Display Name",
    defaultValue: user?.displayName || "",
  },
  {
    name: "currentPassword",
    label: "Current Password",
    category: "text-input",
    type: "password",
    placeholder: "Password",
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
      <CustomText>Edit Profile</CustomText>

      <Form
        fields={getEditProfileFields(user)}
        onSubmit={async (data) => {
          await updateProfile(data.currentPassword, {
            displayName: data.displayName,
          });
        }}
        submitButtonText="Save Changes"
        isLoading={loading}
        options={{ mode: "onBlur" }}
        zodSchema={editProfileFormSchema}
      />
    </ScrollView>
  );
};

export default EditProfileScreen;
