import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "@components/CustomButton";
import OrSeperator from "@components/OrSeperator";
import useAuthMethods from "@src/hooks/useAuthMethods";
import NavigationLink from "@components/NavigationLink";
import BackButton from "@components/BackButton";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { setLoading, selectIsLoading } from "@src/redux/slices/uiSlice";
import AppleSignInButton from "@components/AppleSignInButton";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const loading = useAppSelector(selectIsLoading);
  const dispatch = useAppDispatch();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const { handleLoginWithEmail, handleLoginWithGoogle, handleLoginWithApple } =
    useAuthMethods();

  const performLogin = async (
    loginAction: () => Promise<{ success: boolean; message?: string }>,
    failureMessage: string
  ) => {
    dispatch(setLoading(true));
    const result = await loginAction();
    dispatch(setLoading(false));
    if (!result.success) {
      Alert.alert("Login Failed", result.message || failureMessage);
    }
  };

  return (
    <View>
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
        style={{ textAlign: "right", marginLeft: "auto" }}
      />
      <CustomButton
        onPress={() =>
          performLogin(
            () => handleLoginWithEmail(email, password),
            "Please check your credentials and try again."
          )
        }
        title={"Log In with Email"}
        disabled={loading}
      />
      <OrSeperator />
      <CustomButton
        onPress={() =>
          performLogin(handleLoginWithGoogle, "Unable to login with Google.")
        }
        title={"Log in with Google"}
        icon={require("assets/images/google-logo.png")}
        style={{
          backgroundColor: globalColors.card,
          paddingVertical: 18,
        }}
        textStyle={{ color: globalColors.cardText }}
        disabled={loading}
      />
      <AppleSignInButton
        onPress={() =>
          performLogin(handleLoginWithApple, "Unable to login with Apple.")
        }
        disabled={loading}
      />
      <NavigationLink
        text={"Don't have an account? Sign Up"}
        path={"/auth/signup"}
        style={{ textAlign: "center" }}
      />
    </View>
  );
};

export default LoginScreen;
