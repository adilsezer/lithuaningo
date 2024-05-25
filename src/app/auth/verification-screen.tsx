import React from "react";
import { View, Text, Alert } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import CustomButton from "@components/CustomButton";
import BackButton from "@components/BackButton";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectIsLoading, setLoading } from "@src/redux/slices/uiSlice";

const VerificationScreen: React.FC = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectIsLoading);

  const { handleSendEmailVerification } = useAuthMethods();

  const onResendVerificationEmail = async () => {
    dispatch(setLoading(true)); // Dispatch action to set loading true
    const result = await handleSendEmailVerification();
    dispatch(setLoading(false)); // Dispatch action to set loading false
    if (result.success) {
      Alert.alert(
        "Success",
        "Verification email sent. Please check your inbox."
      );
    } else {
      Alert.alert(
        "Error",
        result.message || "Failed to resend verification email."
      );
    }
  };

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.title}>Email Verification Required</Text>
      <Text style={globalStyles.text}>
        Please check your email to verify your account. If you haven't received
        the email, you can resend it below.
      </Text>
      <CustomButton
        onPress={onResendVerificationEmail}
        title={loading ? "Resending..." : "Resend Verification Email"}
        disabled={loading}
        style={globalStyles.button}
      />
    </View>
  );
};

export default VerificationScreen;
