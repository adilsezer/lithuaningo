import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet } from "react-native";
import OrSeperator from "@components/OrSeperator";
import CustomButton from "@components/CustomButton";
import useAuthMethods from "@src/hooks/useAuthMethods"; // Corrected import statement
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { setLoading, selectIsLoading } from "@src/redux/slices/uiSlice";

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const loading = useAppSelector(selectIsLoading);
  const dispatch = useAppDispatch();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const { handleSignUpWithEmail, handleLoginWithGoogle } = useAuthMethods();

  const performSignUp = async (
    action: () => Promise<{ success: boolean; message?: string }>
  ) => {
    dispatch(setLoading(true));
    const result = await action();
    dispatch(setLoading(false));
    if (result.success) {
      Alert.alert("Sign Up Successful", result.message);
    } else {
      Alert.alert(
        "Sign Up Failed",
        result.message || "An error occurred during sign up."
      );
    }
  };

  const handleSignUp = () => {
    if (confirmPassword !== password) {
      Alert.alert("Error", "Passwords don't match");
      return;
    } else if (!displayName) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    performSignUp(() => handleSignUpWithEmail(email, password, displayName));
  };

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.title}>Create Account</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Name"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="none"
        placeholderTextColor={globalColors.placeholder}
      />
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
      <CustomButton
        onPress={handleSignUp}
        title={"Sign Up"}
        disabled={loading}
      />
      <OrSeperator />
      <CustomButton
        onPress={() => performSignUp(handleLoginWithGoogle)}
        title={"Sign up with Google"}
        icon={require("assets/images/google-logo.png")}
        style={{ backgroundColor: globalColors.card }}
        textStyle={{ color: globalColors.cardText }}
        disabled={loading}
      />
    </View>
  );
};

export default SignUpScreen;
