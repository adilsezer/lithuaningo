// LoginScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, ActivityIndicator } from "react-native";
import ErrorMessage from "src/features/auth/components/ErrorMessage";
import { useThemeStyles } from "@src/hooks/useThemeStyles"; // Adjust the import path as necessary
import CustomButton from "@features/auth/components/CustomButton";
import OrSeperator from "@components/OrSeperator";
import { useSignInMethods } from "@src/hooks/useSignInMethods";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const { handleLoginWithEmail, handleLoginWithGoogle, loading, error } =
    useSignInMethods();

  return (
    <View style={globalStyles.viewContainer}>
      <Text style={globalStyles.title}>Login</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={globalColors.placeholder}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        placeholderTextColor={globalColors.placeholder}
      />
      {loading ? (
        <ActivityIndicator size="small" color={globalColors.loading} />
      ) : (
        <>
          <CustomButton
            onPress={() => handleLoginWithEmail(email, password)}
            title={"Log In with Email"}
          ></CustomButton>
          <OrSeperator />
          <CustomButton
            onPress={handleLoginWithGoogle}
            title={"Log in with Google"}
            icon={require("assets/google-logo.png")}
            style={{
              backgroundColor: "#f2f2f2",
            }}
            textStyle={{ color: "#1d1d1d" }}
          ></CustomButton>
        </>
      )}
      {error && <ErrorMessage message={error} />}
    </View>
  );
};

export default LoginScreen;
