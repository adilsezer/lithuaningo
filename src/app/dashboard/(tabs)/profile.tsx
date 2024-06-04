import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import useAuthMethods from "@src/hooks/useAuthMethods"; // Corrected import statement
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData, selectIsLoggedIn } from "@src/redux/slices/userSlice";
import CustomButton from "@components/CustomButton";
import { useRouter } from "expo-router";
import { setLoading } from "@src/redux/slices/uiSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

export default function ProfileScreen() {
  const { styles: globalStyles } = useThemeStyles();
  const dispatch = useAppDispatch();
  const { handleSignOut } = useAuthMethods();
  const router = useRouter();

  const logout = async () => {
    dispatch(setLoading(true));
    await handleSignOut();
    dispatch(setLoading(false));
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const userData = useAppSelector(selectUserData);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  if (!isLoggedIn || !userData) {
    return (
      <View style={styles.container}>
        <Text style={globalStyles.title}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={globalStyles.title}>{userData.name || "User"}</Text>
        <Text style={globalStyles.subtitle}>{userData.email}</Text>
      </View>

      <View style={styles.actionsSection}>
        <CustomButton
          title="Edit Profile"
          onPress={() => navigateTo("/profile/edit-profile")}
        />
        <CustomButton
          title="Change Password"
          onPress={() => navigateTo("/profile/change-password")}
        />
        <CustomButton
          title="About the App"
          onPress={() => navigateTo("/about")}
        />
        <CustomButton title="Logout" onPress={logout} />
        {userData.isAdmin && (
          <CustomButton
            title="Admin Panel"
            onPress={() => navigateTo("/admin")}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
  },
  actionsSection: {
    marginTop: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 75,
    marginVertical: 10,
  },
});
