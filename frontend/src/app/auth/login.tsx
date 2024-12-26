import React, { useEffect, useState } from "react";
import { Text, ScrollView } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import useAuthMethods from "@hooks/useAuthMethods";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import CustomTextInput from "@components/ui/CustomTextInput";
import NavigationLink from "@components/layout/NavigationLink";
import BackButton from "@components/layout/BackButton";
import OrSeparator from "@components/ui/OrSeparator";
import { SocialAuthButtons } from "@components/auth/SocialAuthButtons";
import { useAuthOperation } from "@hooks/useAuthOperation";
import crashlytics from "@react-native-firebase/crashlytics";
import CustomButton from "@components/ui/CustomButton";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loading = useAppSelector(selectIsLoading);
  const { styles: globalStyles } = useThemeStyles();
  const { handleLoginWithEmail, handleLoginWithGoogle, handleLoginWithApple } =
    useAuthMethods();
  const { performAuthOperation } = useAuthOperation();

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
        secureTextEntry
      />

      <CustomButton
        onPress={() =>
          performAuthOperation(
            () => handleLoginWithEmail(email, password),
            "Login Failed"
          )
        }
        title="Log In with Email"
        disabled={loading}
      />

      <NavigationLink text="Forgot Password?" path="/auth/forgot-password" />

      <OrSeparator />

      <SocialAuthButtons
        onGooglePress={() =>
          performAuthOperation(handleLoginWithGoogle, "Google Login Failed")
        }
        onApplePress={() =>
          performAuthOperation(handleLoginWithApple, "Apple Login Failed")
        }
        disabled={loading}
      />

      <NavigationLink
        text="Don't have an account? Sign Up"
        path="/auth/signup"
        style={{ textAlign: "center" }}
      />
    </ScrollView>
  );
};

export default LoginScreen;
