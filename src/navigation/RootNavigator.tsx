import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import DashboardScreen from "../features/auth/screens/DashboardScreen";
import AuthTabNavigator from "./AuthTabNavigator";
import { useAppSelector } from "../store/hooks";

type RootStackParamList = {
  Dashboard: undefined;
  LoginSignup: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const userIsAuthenticated = useAppSelector((state) => state.user.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userIsAuthenticated ? (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        ) : (
          <Stack.Screen name="LoginSignup" component={AuthTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
