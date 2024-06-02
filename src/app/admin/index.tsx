import React from "react";
import { View, Text } from "react-native";
import AdminCardForm from "@components/AdminCardForm";
import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import AddLearningCards from "@components/AddLearningCards";

const AdminScreen: React.FC = () => {
  const { styles: globalStyles } = useThemeStyles();

  return (
    <View>
      <BackButton />
      <Text style={globalStyles.title}>Admin Panel</Text>
      <AdminCardForm />
      <AddLearningCards />
    </View>
  );
};

export default AdminScreen;
