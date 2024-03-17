import React from "react";
import { View, Button } from "react-native";
import { useAppDispatch } from "../store/hooks";
import { logIn } from "../features/auth/redux/userSlice";

const LoginButton: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogin = () => {
    // Dispatch the logIn action with dummy data
    dispatch(logIn({ name: "John Doe", email: "johndoe@example.com" }));
  };

  return (
    <View>
      <Button title="Log In with Dummy Data" onPress={handleLogin} />
    </View>
  );
};

export default LoginButton;
