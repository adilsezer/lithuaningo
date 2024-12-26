import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import useAuthMethods from "@hooks/useAuthMethods";
import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { selectUserData, selectIsLoggedIn } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import { setLoading } from "@redux/slices/uiSlice";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { getCurrentDateKey } from "@utils/dateUtils";
import { clearData } from "@utils/storageUtils";
import ThemeSwitch from "@components/ui/ThemeSwitch";
import { useTheme } from "@context/ThemeContext";
import { SENTENCE_KEYS, QUIZ_KEYS } from "@config/constants";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const dispatch = useAppDispatch();
  const { handleSignOut } = useAuthMethods();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

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

  const handleClearCompletionStatus = async () => {
    if (!userData) {
      Alert.alert("No user data available");
      return;
    }

    const currentDateKey = getCurrentDateKey();
    const keysToClear = [
      SENTENCE_KEYS.COMPLETION_STATUS_KEY(userData.id, currentDateKey),
      SENTENCE_KEYS.SENTENCES_KEY(userData.id, currentDateKey),
      QUIZ_KEYS.QUIZ_PROGRESS_KEY(userData.id, currentDateKey),
      QUIZ_KEYS.QUIZ_QUESTIONS_KEY(userData.id, currentDateKey),
      QUIZ_KEYS.INCORRECT_QUESTIONS_KEY(userData.id, currentDateKey),
      QUIZ_KEYS.INCORRECT_PROGRESS_KEY(userData.id, currentDateKey),
      QUIZ_KEYS.SESSION_STATE_KEY(userData.id, currentDateKey),
    ];

    await Promise.all(keysToClear.map((key) => clearData(key)));
    Alert.alert("Progress data cleared successfully");
  };

  if (!isLoggedIn || !userData) {
    return (
      <View style={styles.container}>
        <Text style={globalStyles.title}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemeSwitch onToggle={toggleTheme} isDarkMode={isDarkMode} />
      <Text style={globalStyles.title}>{userData.name || "User"} </Text>
      <Text style={globalStyles.subtitle}>{userData.email}</Text>
      <View>
        <CustomButton
          title="Edit Profile"
          onPress={() => navigateTo("/profile/edit-profile")}
        />
        <CustomButton
          title="Change Password"
          onPress={() => navigateTo("/profile/change-password")}
        />
        <CustomButton
          title="Delete Account"
          onPress={() => navigateTo("/profile/delete-account")}
        />
        <CustomButton
          title="Settings"
          onPress={() => navigateTo("/profile/settings")}
        />
        <CustomButton
          title="About the App"
          onPress={() => navigateTo("/about")}
        />
        <CustomButton title="Logout" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
