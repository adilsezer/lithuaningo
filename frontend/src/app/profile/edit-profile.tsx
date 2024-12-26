import React, { useState } from "react";
import { Text, Alert, ScrollView } from "react-native";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import { updateUserProfile as updateUserProfileAction } from "@redux/slices/userSlice";
import useAuthMethods from "@hooks/useAuthMethods";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import BackButton from "@components/layout/BackButton";
import { useRouter } from "expo-router";
import CustomTextInput from "@components/ui/CustomTextInput";
import auth from "@react-native-firebase/auth";

const EditProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleUpdateUserProfile } = useAuthMethods();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleUpdateProfile = async () => {
    if (!name) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await handleUpdateUserProfile(
        isPasswordProvider ? currentPassword : "",
        {
          displayName: name,
        }
      );
      if (result.success) {
        dispatch(updateUserProfileAction({ name }));
        Alert.alert("Success", "Profile updated successfully.");
        router.push("/dashboard/profile");
      } else {
        Alert.alert("Error", result.message || "Failed to update profile.");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <ScrollView>
      <BackButton />
      <Text style={globalStyles.title}>Edit Profile</Text>
      {isPasswordProvider && (
        <CustomTextInput
          style={globalStyles.input}
          placeholder="Current Password"
          value={currentPassword}
          secureTextEntry
          onChangeText={setCurrentPassword}
          placeholderTextColor={globalColors.placeholder}
        />
      )}
      <CustomTextInput
        style={globalStyles.input}
        placeholder="User Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={globalColors.placeholder}
      />
      <CustomButton title="Save Changes" onPress={handleUpdateProfile} />
    </ScrollView>
  );
};

export default EditProfileScreen;
