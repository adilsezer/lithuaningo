import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import OrSeperator from "@components/OrSeperator";
import CustomButton from "@components/CustomButton";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import { useThemeStyles } from "src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const { handleSignUpWithEmail, handleLoginWithGoogle } = useAuthMethods();

  const handleSignUp = () => {
    if (confirmPassword !== password) {
      Alert.alert("Error", "Passwords doesn't match");
      return;
    }
    handleSignUpWithEmail(email, password);
  };

  return (
    <View>
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

export default SignUpScreen;
