// SignupScreen.tsx
import OrSeperator from "@components/OrSeperator";
import CustomButton from "@features/auth/components/CustomButton";
import { useSignInMethods } from "@src/hooks/useSignInMethods";
import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useThemeStyles } from "src/hooks/useThemeStyles";

const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const handleSignup = () => {
    // Implement your signup logic here
    // Make sure to validate the input (e.g., check if the passwords match)
    console.log(email, password, confirmPassword);
  };

  const { handleLoginWithGoogle, loading, error } = useSignInMethods();

  return (
    <View style={globalStyles.viewContainer}>
      <Text style={globalStyles.title}>Sign Up</Text>
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
      <CustomButton onPress={handleSignup} title={"Sign Up"}></CustomButton>
      <OrSeperator />
      <CustomButton
        onPress={handleLoginWithGoogle}
        title={"Sign up with Google"}
        icon={require("assets/google-logo.png")}
        style={{
          backgroundColor: "#f2f2f2",
        }}
        textStyle={{ color: "#1d1d1d" }}
      ></CustomButton>
    </View>
  );
};

export default SignupScreen;
