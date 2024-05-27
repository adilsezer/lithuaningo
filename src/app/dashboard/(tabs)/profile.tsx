// ProfileScreen.tsx
import React, { useEffect } from "react";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData, selectIsLoggedIn } from "@src/redux/slices/userSlice";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import CustomButton from "@components/CustomButton";
import { useRouter } from "expo-router";
import { setLoading } from "@src/redux/slices/uiSlice";

export default function ProfileScreen() {
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
        <Text style={styles.name}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.name}>{userData.name || "User"}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        {userData.photoURL ? (
          <Image
            source={{ uri: userData.photoURL }}
            style={styles.profilePic}
          />
        ) : (
          <Text>No profile picture</Text>
        )}
      </View>

      <View style={styles.actionsSection}>
        <CustomButton
          title="Edit Profile"
          onPress={() => navigateTo("/profile/edit-profile")}
          style={{ width: "90%" }}
        />
        <CustomButton
          title="Change Password"
          onPress={() => navigateTo("/profile/change-password")}
          style={{ width: "90%" }}
        />
        <CustomButton
          title="About the App"
          onPress={() => navigateTo("/about")}
          style={{ width: "90%" }}
        />
        <CustomButton
          title="Logout"
          onPress={logout}
          style={{ width: "90%" }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  profileSection: {
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 18,
    color: "#666",
  },
  actionsSection: {
    marginTop: 30,
  },
  button: {
    backgroundColor: "#ECEFF1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 75,
    marginVertical: 10,
  },
});
