import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import useAuthMethods from "@src/hooks/useAuthMethods";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData, selectIsLoggedIn } from "@src/redux/slices/userSlice";
import CustomButton from "@components/CustomButton";
import { useRouter } from "expo-router";
import { setLoading } from "@src/redux/slices/uiSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { getCurrentDateKey } from "@utils/dateUtils";
import { clearData } from "@utils/storageUtils";
import ThemeSwitch from "@components/ThemeSwitch";
import { useTheme } from "@src/context/ThemeContext";
import crashlytics from "@react-native-firebase/crashlytics";

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
      `completionStatus_${userData.id}_${currentDateKey}`,
      `sentences_${userData.id}_${currentDateKey}`,
      `quizProgress_${userData.id}_${currentDateKey}`,
      `questions_${userData.id}_${currentDateKey}`,
      `incorrectQuestions_${userData.id}_${currentDateKey}`,
      `quizQuestions_${userData.id}_${currentDateKey}`,
      `incorrectProgress_${userData.id}_${currentDateKey}`,
      `sessionState_${userData.id}_${currentDateKey}`, // Added sessionState key
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
      <Text style={globalStyles.title}>{userData.name || "User"}</Text>
      <Text style={globalStyles.subtitle}>{userData.email}</Text>

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
        {__DEV__ && (
          <CustomButton
            title="Clear Completion Status"
            onPress={handleClearCompletionStatus}
          />
        )}
        {__DEV__ && (
          <CustomButton
            title="Test Crash"
            onPress={() => crashlytics().crash()}
          />
        )}
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
  actionsSection: {
    marginTop: 10,
  },
});
