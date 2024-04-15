import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import OrSeperator from "@components/OrSeperator";
import BackButton from "@components/BackButton";
import CustomButton from "@components/CustomButton";
import ResponseMessage from "@components/ResponseMessage";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import { useThemeStyles } from "src/hooks/useThemeStyles"; // Ensure path correctness
import LoadingIndicator from "@components/LoadingIndicator";

const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [localError, setLocalError] = useState<string>(""); // Local state to manage password mismatch error
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const {
    handleSignUpWithEmail,
    handleLoginWithGoogle,
    loading,
    error,
    successMessage,
  } = useAuthMethods();

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return; // Stop the signup process if passwords do not match
    }
    setLocalError(""); // Clear any existing errors
    handleSignUpWithEmail(email, password);
  };

  const displayedError = localError || error;

  return (
    <View style={globalStyles.viewContainer}>
      {loading && <LoadingIndicator />}
      <BackButton />
      <Text style={globalStyles.title}>Create Account</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={globalColors.placeholder}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={globalColors.placeholder}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor={globalColors.placeholder}
      />
      {displayedError && (
        <ResponseMessage message={displayedError} type="error" />
      )}
      {successMessage && (
        <ResponseMessage message={successMessage} type="success" />
      )}
      <CustomButton onPress={handleSignUp} title={"Sign Up"} />
      <OrSeperator />
      <CustomButton
        onPress={handleLoginWithGoogle}
        title={"Sign up with Google"}
        icon={require("assets/images/google-logo.png")}
        style={{
          backgroundColor: "#f2f2f2",
        }}
        textStyle={{ color: "#1d1d1d" }}
      />
    </View>
  );
};

export default SignupScreen;
