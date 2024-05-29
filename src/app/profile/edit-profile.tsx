import React, { useState } from "react";
import { View, Text, TextInput, Alert, Image, StyleSheet } from "react-native";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { setLoading } from "@src/redux/slices/uiSlice";
import {
  selectUserData,
  updateUserProfile as updateUserProfileAction,
} from "@src/redux/slices/userSlice";
import useAuthMethods from "@src/hooks/useAuthMethods"; // Corrected import statement
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const EditProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleUpdateUserProfile } = useAuthMethods(); // Corrected hook usage inside the component
  const router = useRouter();

  const [name, setName] = useState<string>(userData?.name || "");
  const [photoURL, setPhotoURL] = useState<string>(userData?.photoURL || "");

  const handleUpdateProfile = async () => {
    if (!name) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await handleUpdateUserProfile({
        displayName: name,
        photoURL,
      });
      if (result.success) {
        dispatch(updateUserProfileAction({ name, photoURL }));
        Alert.alert("Success", "Profile updated successfully.");
        router.push("/dashboard/profile");
      } else {
        Alert.alert("Error", result.message || "Failed to update profile.");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.title}>Edit Profile</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={globalColors.placeholder}
      />
      <View style={styles.imagePickerContainer}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.image} />
        ) : (
          <Text style={styles.noImageText}>No photo selected</Text>
        )}
      </View>
      <CustomButton title="Choose Photo" onPress={pickImage} />
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
  noImageText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 10,
  },
});

export default EditProfileScreen;
