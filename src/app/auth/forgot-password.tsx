import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import useAuthMethods from "@src/hooks/useAuthMethods"; // Corrected import statement
import CustomButton from "@components/CustomButton";
import BackButton from "@components/BackButton";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectIsLoading, setLoading } from "@src/redux/slices/uiSlice";
import CustomTextInput from "@components/CustomTextInput";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectIsLoading);

  const { handlePasswordReset } = useAuthMethods();

  const onResetPassword = async () => {
    if (!email) {
      Alert.alert("Input Required", "Please enter your email address.");
      return;
    }
    dispatch(setLoading(true)); // Dispatch action to set loading true
    const result = await handlePasswordReset(email);
    dispatch(setLoading(false)); // Dispatch action to set loading false
    if (result.success) {
      Alert.alert("Success", result.message);
    } else {
      Alert.alert(
        "Error",
        result.message || "Failed to send password reset email."
      );
    }
  };

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.title}>Forgot Password?</Text>
      <Text style={globalStyles.text}>
        Enter your email and we will send you a link to reset your password.
      </Text>
      <CustomTextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={globalColors.placeholder}
      />
      <CustomButton
        onPress={onResetPassword}
        title={loading ? "Sending..." : "Continue"}
        disabled={loading}
      />
    </View>
  );
};

export default ForgotPasswordScreen;
