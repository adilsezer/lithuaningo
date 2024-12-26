import React, { useState } from "react";
import { Text, Alert, ScrollView } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import useAuthMethods from "@hooks/useAuthMethods";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectIsLoading, setLoading } from "@redux/slices/uiSlice";
import CustomTextInput from "@components/ui/CustomTextInput";
import crashlytics from "@react-native-firebase/crashlytics";

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
    dispatch(setLoading(true));
    const result = await handlePasswordReset(email);
    dispatch(setLoading(false));
    if (result.success) {
      Alert.alert("Success", result.message);
    } else {
      crashlytics().recordError(
        new Error(result.message || "Failed to send password reset email.")
      );
      Alert.alert(
        "Error",
        result.message || "Failed to send password reset email."
      );
    }
  };

  return (
    <ScrollView>
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
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
