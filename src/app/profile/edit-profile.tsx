import React, { useState } from "react";
import { View, Text, TextInput, Alert, Image, StyleSheet } from "react-native";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { setLoading } from "@src/redux/slices/uiSlice";
import { updateUserProfile as updateUserProfileAction } from "@src/redux/slices/userSlice";
import useAuthMethods from "@src/hooks/useAuthMethods"; // Corrected import statement
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";
import { useRouter } from "expo-router";

const EditProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleUpdateUserProfile } = useAuthMethods(); // Corrected hook usage inside the component
  const router = useRouter();

  const [name, setName] = useState<string>("");

  const handleUpdateProfile = async () => {
    if (!name) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await handleUpdateUserProfile({
        displayName: name,
      });
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
    <View>
      <BackButton />
      <Text style={globalStyles.title}>Edit Profile</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="User Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={globalColors.placeholder}
      />
      <CustomButton title="Save Changes" onPress={handleUpdateProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  imagePickerContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 10,
  },
});

export default EditProfileScreen;
