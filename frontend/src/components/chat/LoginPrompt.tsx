import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';

const LoginPrompt: React.FC = () => {
  return (
    <Surface style={styles.container}>
      <Text style={styles.text}>Please log in to use the AI assistant.</Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEEBA',
  },
  text: {
    color: '#856404',
    textAlign: 'center',
  },
});

export default LoginPrompt;
