import React, { useEffect, useState } from "react";
import { Text, Alert, Platform, ScrollView } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "@components/CustomButton";
import OrSeperator from "@components/OrSeperator";
import useAuthMethods from "@src/hooks/useAuthMethods";
import NavigationLink from "@components/NavigationLink";
import BackButton from "@components/BackButton";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { setLoading, selectIsLoading } from "@src/redux/slices/uiSlice";
import AppleSignInButton from "@components/AppleSignInButton";
import CustomTextInput from "@components/CustomTextInput";
import crashlytics from "@react-native-firebase/crashlytics";

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
      crashlytics().recordError(new Error("Login failed"));
      Alert.alert("Login Failed", result.message || failureMessage);
    }
  };

  useEffect(() => {
    crashlytics().log("Login screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <Text style={globalStyles.title}>Welcome Back</Text>
      <CustomTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <CustomTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
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
      <NavigationLink
        text={"Forgot Password?"}
        path={"/auth/forgot-password"}
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
      {Platform.OS === "ios" && (
        <AppleSignInButton
          onPress={() =>
            performLogin(handleLoginWithApple, "Unable to login with Apple.")
          }
          disabled={loading}
        />
      )}
      <NavigationLink
        text={"Don't have an account? Sign Up"}
        path={"/auth/signup"}
        style={{ textAlign: "center" }}
      />
    </ScrollView>
  );
};

export default LoginScreen;
