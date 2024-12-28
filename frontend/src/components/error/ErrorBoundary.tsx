import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, StyleSheet, Linking, Image, Alert } from "react-native";
import crashlytics from "@react-native-firebase/crashlytics";
import CustomButton from "@components/ui/CustomButton";
import { SectionTitle, Subtitle } from "@components/typography";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    crashlytics().recordError(error);
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleContactSupport = async () => {
    try {
      await Linking.openURL("mailto:Lithuaningo@gmail.com");
    } catch (error) {
      console.error("Failed to open URL:", error);
      Alert.alert("Error", "Failed to open email client.");
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Image
            source={require("assets/images/icon.png")}
            style={styles.logo}
          />
          <SectionTitle>Oops! Something went wrong.</SectionTitle>
          <Subtitle>
            Please try again or contact support if the issue persists.
          </Subtitle>
          <CustomButton title="Try Again" onPress={this.handleRetry} />
          <CustomButton
            title="Contact Support"
            onPress={this.handleContactSupport}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 20,
  },
});

export default ErrorBoundary;
