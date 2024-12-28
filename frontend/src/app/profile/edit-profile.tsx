import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import auth from "@react-native-firebase/auth";
import { SectionTitle } from "@components/typography";
import { AlertDialog } from "@components/ui/AlertDialog";

const EditProfileScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      AlertDialog.error("Name is required");
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile(isPasswordProvider ? currentPassword : "", {
        displayName: name.trim(),
      });
      AlertDialog.success("Profile updated successfully");
    } catch (err) {
      AlertDialog.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <SectionTitle>Edit Profile</SectionTitle>

      {isPasswordProvider && (
        <CustomTextInput
          style={styles.input}
          placeholder="Current Password"
          value={currentPassword}
          secureTextEntry
          onChangeText={setCurrentPassword}
          placeholderTextColor={colors.placeholder}
        />
      )}

      <CustomTextInput
        style={styles.input}
        placeholder="User Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.placeholder}
      />

      <CustomButton
        title="Save Changes"
        onPress={handleUpdateProfile}
        style={styles.button}
        disabled={isLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});

export default EditProfileScreen;
