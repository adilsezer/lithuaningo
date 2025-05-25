import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Avatar } from 'react-native-paper';
import CustomText from './CustomText';

interface NotificationDisplayProps {
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonAction?: () => void;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  title,
  subtitle,
  buttonText,
  buttonAction,
}) => {
  return (
    <View style={styles.container}>
      <Avatar.Image
        size={100}
        source={require('../../../assets/images/icon.png')}
        style={styles.logo}
      />
      <CustomText variant='headlineMedium' style={styles.title}>
        {title}
      </CustomText>
      <CustomText variant='bodyMedium' style={styles.subtitle}>
        {subtitle}
      </CustomText>
      {buttonText && buttonAction && (
        <Button mode='contained' onPress={buttonAction} style={styles.button}>
          {buttonText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
  },
});

export default NotificationDisplay;
