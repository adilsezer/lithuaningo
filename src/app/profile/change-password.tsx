import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useAppDispatch } from "@src/redux/hooks";
import { setLoading } from "@src/redux/slices/uiSlice";
import useAuthMethods from "@src/hooks/useAuthMethods"; // Corrected import statement
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";
import { useRouter } from "expo-router";
import CustomTextInput from "@components/CustomTextInput";

const ChangePasswordScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const { handleUpdateUserPassword } = useAuthMethods(); // Corrected hook usage inside the component
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    dispatch(setLoading(true));

    try {
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
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.title}>Change Password</Text>
      <CustomTextInput
        style={globalStyles.input}
        placeholder="Current Password"
        value={currentPassword}
        secureTextEntry
        onChangeText={setCurrentPassword}
        placeholderTextColor={globalColors.placeholder}
      />
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
    </View>
  );
};

export default ChangePasswordScreen;
