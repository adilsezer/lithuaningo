import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import auth from "@react-native-firebase/auth";
import { SectionTitle, Instruction } from "@components/typography";

const EditProfileScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const { updateProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleUpdateProfile = async () => {
    if (!name) return;

    await updateProfile(isPasswordProvider ? currentPassword : "", {
      displayName: name,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <SectionTitle>Edit Profile</SectionTitle>

      {isPasswordProvider && (
        <>
          <Instruction>
            Please enter your current password to make changes
          </Instruction>
          <CustomTextInput
            style={styles.input}
            placeholder="Current Password"
            value={currentPassword}
            secureTextEntry
            onChangeText={setCurrentPassword}
            placeholderTextColor={colors.placeholder}
          />
        </>
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
