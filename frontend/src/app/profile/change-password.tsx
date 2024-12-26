import React, { useState } from "react";
import { ScrollView, Text, Alert, StyleSheet } from "react-native";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import useAuthMethods from "@hooks/useAuthMethods";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import BackButton from "@components/layout/BackButton";
import { useRouter } from "expo-router";
import CustomTextInput from "@components/ui/CustomTextInput";
import auth from "@react-native-firebase/auth";

const ChangePasswordScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleUpdateUserPassword } = useAuthMethods();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    dispatch(setLoading(true));

    try {
      if (isPasswordProvider) {
        const result = await handleUpdateUserPassword(
          currentPassword,
          newPassword
        );
        if (result.success) {
          Alert.alert("Success", "Password updated successfully.");
          router.push("/dashboard/profile");
        } else {
          Alert.alert("Error", result.message || "Failed to update password.");
        }
      } else {
        Alert.alert(
          "Error",
          "Password change is not supported for your login method."
        );
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <ScrollView>
      <BackButton />
      <Text style={globalStyles.title}>Change Password</Text>
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
        placeholder="New Password"
        value={newPassword}
        secureTextEntry
        onChangeText={setNewPassword}
        placeholderTextColor={globalColors.placeholder}
      />
      <CustomTextInput
        style={globalStyles.input}
        placeholder="Confirm New Password"
        value={confirmNewPassword}
        secureTextEntry
        onChangeText={setConfirmNewPassword}
        placeholderTextColor={globalColors.placeholder}
      />
      <CustomButton title="Change Password" onPress={handleChangePassword} />
    </ScrollView>
  );
};

export default ChangePasswordScreen;
