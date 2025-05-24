import React, { useState, useEffect } from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import { useIsLoading } from '@stores/useUIStore';
import {
  useTheme,
  ActivityIndicator,
  Portal,
  Modal,
  Surface,
} from 'react-native-paper';

interface LoadingIndicatorProps {
  modal?: boolean;
  style?: ViewStyle;
  size?: 'small' | 'large';
  minimumDisplayTime?: number;
  color?: string;
  useTheme?: boolean;
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
  },
});

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  modal = true,
  style,
  size = 'large',
  minimumDisplayTime = 200,
  color,
}) => {
  const theme = useTheme();
  const indicatorColor = color || theme.colors.primary;

  const globalIsLoading = useIsLoading();
  const [showLoading, setShowLoading] = useState(false);
  const [delayedIsLoading, setDelayedIsLoading] = useState(false);

  useEffect(() => {
    if (!modal) {return;}

    let timer: ReturnType<typeof setTimeout>;

    if (globalIsLoading) {
      setDelayedIsLoading(true);
    } else if (delayedIsLoading) {
      timer = setTimeout(() => {
        setDelayedIsLoading(false);
      }, minimumDisplayTime);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [globalIsLoading, delayedIsLoading, modal, minimumDisplayTime]);

  useEffect(() => {
    setShowLoading(delayedIsLoading);
  }, [delayedIsLoading]);

  if (!modal) {
    return (
      <ActivityIndicator
        size={size}
        color={indicatorColor}
        style={style}
        accessibilityLabel="Loading content"
      />
    );
  }

  return (
    <Portal>
      <Modal
        visible={showLoading}
        dismissable={false}
        contentContainerStyle={[
          styles.modalContent,
          { backgroundColor: theme.colors.background },
        ]}
        style={styles.modalContainer}
      >
        <Surface style={styles.surface} elevation={4}>
          <ActivityIndicator
            size="large"
            color={indicatorColor}
            animating={showLoading}
            accessibilityLabel="Loading content"
          />
        </Surface>
      </Modal>
    </Portal>
  );
};

export default LoadingIndicator;
