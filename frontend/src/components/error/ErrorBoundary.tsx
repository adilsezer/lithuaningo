import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Image, Linking, View } from "react-native";
import crashlytics from "@react-native-firebase/crashlytics";
import { Card, Button, Text } from "react-native-paper";

interface Props {
  children: ReactNode;
  showError: (message: string) => void;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
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
    const { showError } = this.props;
    try {
      await Linking.openURL("mailto:Lithuaningo@gmail.com");
    } catch (error) {
      console.error("Failed to open URL:", error);
      showError("Failed to open email client");
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.content}>
              <Image
                source={require("assets/images/icon.png")}
                style={styles.logo}
              />
              <Text variant="titleLarge" style={styles.title}>
                Oops! Something went wrong.
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                Please try again or contact support if the issue persists.
              </Text>
              <Button
                mode="contained"
                onPress={this.handleRetry}
                style={styles.button}
              >
                Try Again
              </Button>
              <Button
                mode="outlined"
                onPress={this.handleContactSupport}
                style={styles.outlinedButton}
              >
                Contact Support
              </Button>
            </Card.Content>
          </Card>
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
    backgroundColor: "#F4EFF7",
    padding: 20,
  },
  card: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    borderRadius: 12,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginBottom: 15,
  },
  button: {
    width: "100%",
    marginBottom: 10,
  },
  outlinedButton: {
    width: "100%",
    borderWidth: 1.5,
  },
});

export default ErrorBoundary;
