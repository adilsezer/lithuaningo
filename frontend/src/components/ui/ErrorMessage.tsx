import React from 'react';
import { View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import CustomButton from './CustomButton';
import CustomText from '@components/ui/CustomText';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  secondaryButtonText?: string;
  textStyle?: TextStyle;
  containerStyle?: ViewStyle;
  fullScreen?: boolean;
  buttonText?: string;
  showCard?: boolean;
  icon?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Oops! Something went wrong.',
  message,
  onRetry,
  onSecondaryAction,
  secondaryButtonText,
  textStyle,
  containerStyle,
  fullScreen = false,
  buttonText = 'Try Again',
  showCard = true,
  icon,
}) => {
  const theme = useTheme();

  const content = (
    <>
      {title && (
        <CustomText
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.error }]}
        >
          {title}
        </CustomText>
      )}
      <CustomText
        style={[styles.message, { color: theme.colors.error }, textStyle]}
      >
        {message}
      </CustomText>
      <View style={styles.buttonsContainer}>
        {onRetry && (
          <CustomButton
            title={buttonText}
            onPress={onRetry}
            style={styles.button}
            icon={icon}
          />
        )}
        {onSecondaryAction && (
          <CustomButton
            title={secondaryButtonText || 'Go Back'}
            onPress={onSecondaryAction}
            mode="outlined"
            style={styles.button}
          />
        )}
      </View>
    </>
  );

  const containerStyles = [
    fullScreen ? styles.fullScreenContainer : styles.container,
    containerStyle,
  ];

  if (showCard) {
    return (
      <View style={containerStyles}>
        <Card style={styles.card}>
          <Card.Content>{content}</Card.Content>
        </Card>
      </View>
    );
  }

  return <View style={containerStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  button: {
    width: '100%',
  },
});

export default ErrorMessage;
