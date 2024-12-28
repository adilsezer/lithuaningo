import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useAuth } from "@hooks/useAuth";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import CustomTextInput from "@components/ui/CustomTextInput";
import { SectionTitle, Instruction } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const { colors } = useThemeStyles();
  const loading = useAppSelector(selectIsLoading);
  const { resetPassword } = useAuth();

  const onResetPassword = async () => {
    if (!email) return;
    await resetPassword(email);
  };

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Forgot Password?</SectionTitle>
      <Instruction>
        Enter your email and we will send you a link to reset your password.
      </Instruction>
      <CustomTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={colors.placeholder}
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
