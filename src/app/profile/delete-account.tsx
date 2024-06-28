import React, { useState } from "react";
import { View, Alert, Text } from "react-native";
import useAuthMethods from "../../hooks/useAuthMethods";
import CustomTextInput from "@components/CustomTextInput";
import BackButton from "@components/BackButton";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import auth from "@react-native-firebase/auth";

const DeleteAccountScreen = () => {
  const [password, setPassword] = useState("");
  const { handleDeleteUserAccount } = useAuthMethods();
  const { styles: globalStyles } = useThemeStyles();

  const user = auth().currentUser;
  const isPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await handleDeleteUserAccount(
                isPasswordProvider ? password : undefined
              );
              if (result.success) {
                Alert.alert("Success", result.message);
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Unknown error occurred"
                );
              }
            } catch (error: any) {
              if (error.code === "auth/wrong-password") {
                Alert.alert("Error", "Incorrect password. Please try again.");
              } else if (error instanceof Error) {
                Alert.alert("Error", error.message);
              } else {
                Alert.alert("Error", "An unknown error occurred");
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.text}>
        Deleting your account is a permanent action and cannot be undone. All
        your data will be lost.
        {isPasswordProvider &&
          " To proceed, please enter your password below to confirm your identity and delete your account."}
      </Text>
      {isPasswordProvider && (
        <CustomTextInput
          secureTextEntry
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
      )}
      <CustomButton title="Delete Account" onPress={handleDelete} />
    </View>
  );
};

export default DeleteAccountScreen;
