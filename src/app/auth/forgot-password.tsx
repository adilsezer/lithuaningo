import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "@components/CustomButton";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import BackButton from "@components/BackButton";
import ResponseMessage from "@components/ResponseMessage";
import LoadingIndicator from "@components/LoadingIndicator";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const { handlePasswordReset, loading, error, successMessage } =
    useAuthMethods();

  return (
    <View style={globalStyles.layoutContainer}>
      {loading && <LoadingIndicator />}
      <BackButton />
      <Text style={globalStyles.title}>Forgot Password?</Text>
      <Text style={globalStyles.text}>
        Enter your email and we'll send you a link to reset your password.
      </Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={globalColors.placeholder}
      />
      {error && <ResponseMessage message={error} type="error" />}
      <CustomButton
        onPress={() => handlePasswordReset(email)}
        title={"Continue"}
      />
      {successMessage && (
        <ResponseMessage message={successMessage} type="success" />
      )}
    </View>
  );
};

export default ForgotPasswordScreen;
