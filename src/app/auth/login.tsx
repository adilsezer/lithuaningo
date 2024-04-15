import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "@components/CustomButton";
import OrSeperator from "@components/OrSeperator";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import BackButton from "@components/BackButton";
import NavigationLink from "@components/NavigationLink";
import ResponseMessage from "@components/ResponseMessage";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const { handleLoginWithEmail, handleLoginWithGoogle, loading, error } =
    useAuthMethods();

  return (
    <View style={globalStyles.viewContainer}>
      <BackButton />
      <Text style={globalStyles.title}>Welcome Back</Text>
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
      <NavigationLink
        text={"Forgot Password?"}
        path={"/auth/forgot-password"}
        style={{ textAlign: "right", marginLeft: "auto" }} // Ensures that the link aligns to the right
      />
      {loading ? (
        <ActivityIndicator size="small" color={globalColors.loading} />
      ) : (
        <>
          <CustomButton
            onPress={() => handleLoginWithEmail(email, password)}
            title={"Log In with Email"}
          />
          <OrSeperator />
          <CustomButton
            onPress={handleLoginWithGoogle}
            title={"Log in with Google"}
            icon={require("assets/images/google-logo.png")}
            style={{
              backgroundColor: "#f2f2f2",
            }}
            textStyle={{ color: "#1d1d1d" }}
          />
          <NavigationLink
            text={"Don't have an account? Sign Up"}
            path={"/auth/signup"}
            style={{ textAlign: "center" }}
          />
        </>
      )}
      {error && <ResponseMessage message={error} type="error" />}
    </View>
  );
};

export default LoginScreen;
