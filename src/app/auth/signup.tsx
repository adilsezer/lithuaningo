import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { useDispatch } from "react-redux";
import OrSeperator from "@components/OrSeperator";
import BackButton from "@components/BackButton";
import CustomButton from "@components/CustomButton";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import { useThemeStyles } from "src/hooks/useThemeStyles";
import { setMessage, clearMessage } from "@features/ui/redux/uiSlice";

const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const dispatch = useDispatch();

  const { handleSignUpWithEmail, handleLoginWithGoogle } = useAuthMethods();

  const handleSignUp = () => {
    if (confirmPassword !== password) {
      dispatch(
        setMessage({ message: "Passwords do not match.", type: "error" })
      );
      return; // Prevent signup if password mismatch
    }
    dispatch(clearMessage());
    handleSignUpWithEmail(email, password);
  };

  return (
    <View style={globalStyles.viewContainer}>
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

export default SignupScreen;
