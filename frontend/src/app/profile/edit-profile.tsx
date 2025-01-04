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
import auth from "@react-native-firebase/auth";

interface EditProfileForm {
  displayName: string;
  email: string;
  currentPassword: string;
}

const editProfileFields: FormField[] = [
  {
    name: "displayName",
    label: "Display Name",
    type: "text",
    rules: FORM_RULES.name,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    rules: FORM_RULES.email,
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

  const defaultValues = {
    displayName: user?.displayName || "",
    email: user?.email || "",
  };

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Edit Profile</SectionTitle>

      <Form<EditProfileForm>
        fields={editProfileFields}
        onSubmit={async (values) => {
          await updateProfile(values.currentPassword, {
            displayName: values.displayName,
            email: values.email,
          });
        }}
        submitButtonText="Save Changes"
        isLoading={loading}
        mode="onBlur"
        defaultValues={defaultValues}
      />
    </ScrollView>
  );
};

export default EditProfileScreen;
