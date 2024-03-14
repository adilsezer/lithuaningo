import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "../features/auth/screens/LoginScreen";
import SignupScreen from "../features/auth/screens/SignupScreen";
// Importing icon component
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const AuthTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"];

          if (route.name === "Login") {
            iconName = focused ? "log-in" : "log-in-outline";
          } else if (route.name === "Signup") {
            iconName = focused ? "person-add" : "person-add-outline";
          } else {
            iconName = "alert"; // Default icon, or handle this case appropriately
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Signup" component={SignupScreen} />
    </Tab.Navigator>
  );
};

export default AuthTabNavigator;
