import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useIsLoading } from "@stores/useUIStore";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { editProfileFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/ui/CustomText";
import { User } from "@supabase/supabase-js";
import { supabase } from "@services/supabase/supabaseClient";
import { useRouter } from "expo-router";

const getEditProfileFields = (user: User | null): FormField[] => [
  {
    name: "displayName",
    label: "Display Name",
    category: "text-input",
    type: "text",
    placeholder: "Display Name",
    defaultValue: user?.user_metadata?.name || "",
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUser(user);
    };

    getUser();
  }, [router]);

  if (!user) {
    return null;
  }

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
