import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
// Importing icon component
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const AuthTabNavigator: React.FC = () => {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
};

export default AuthTabNavigator;
