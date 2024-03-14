import { Button, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, createTheme } from "@rneui/themed";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import RootNavigator from "./src/navigation/RootNavigator";
import crashlytics from "@react-native-firebase/crashlytics";

const theme = createTheme({});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <RootNavigator></RootNavigator>
          <Button title="Crash Test" onPress={() => crashlytics().crash()} />
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
