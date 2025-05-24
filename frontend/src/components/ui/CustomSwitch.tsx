import CustomText from '@components/ui/CustomText';
import React from 'react';
import { View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  switchContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export default function CustomSwitch({
  value,
  onValueChange,
  label,
  error,
  style,
  containerStyle,
  switchContainerStyle,
  labelStyle,
}: CustomSwitchProps) {
  const theme = useTheme();

  // Default styles that can be overridden
  const defaultContainerStyle: ViewStyle = {
    marginVertical: 12,
    width: '100%',
  };

  const defaultSwitchContainerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  };

  const defaultLabelStyle: TextStyle = {
    flex: 1,
    marginRight: 16,
    textAlign: 'left',
    marginVertical: 0,
  };

  return (
    <View style={[defaultContainerStyle, style, containerStyle]}>
      <View style={[defaultSwitchContainerStyle, switchContainerStyle]}>
        <CustomText variant="bodyLarge" style={[defaultLabelStyle, labelStyle]}>
          {label}
        </CustomText>
        <Switch
          value={value}
          onValueChange={onValueChange}
          color={theme.colors.primary}
        />
      </View>
      {error && (
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
