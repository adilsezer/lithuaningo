import { useAuthMethods } from "@src/hooks/useAuthMethods";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch } from "@src/redux/hooks";
import { setLoading } from "@src/redux/slices/uiSlice";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const dummyProfilePic = "https://via.placeholder.com/150";

export default function ProfileScreen() {
  const { styles: globalStyles } = useThemeStyles();
  const dispatch = useAppDispatch();

  const { handleSignOut } = useAuthMethods();

  const logout = async () => {
    dispatch(setLoading(true));
    await handleSignOut();
    dispatch(setLoading(false));
  };

  const profileData = {
    name: "John Doe",
    email: "johndoe@example.com",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.email}>{profileData.email}</Text>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Change Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>

        {/* Add more buttons or components here as needed */}
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
    marginVertical: 20,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
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
});
