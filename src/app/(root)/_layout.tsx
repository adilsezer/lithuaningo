// /app/(root)/index.tsx

import { Redirect, Slot } from "expo-router";
import { useAuth } from "../../context/AuthContext"; // Adjust the import path as needed
import { Text } from "react-native";

const AppLayout: React.FC = () => {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return <Slot />;
};

export default AppLayout;
