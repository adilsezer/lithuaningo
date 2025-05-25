import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import CustomText from './CustomText';
import { useAlertDialog } from '@hooks/useAlertDialog';
import { useIsPremium } from '@stores/useUserStore';

export interface FlashcardCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface CategoryCardProps {
  category: FlashcardCategory;
  onPressPractice: (category: FlashcardCategory) => void;
  onPressMaster?: (category: FlashcardCategory) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = React.memo(
  ({ category, onPressPractice, onPressMaster }) => {
    const theme = useTheme();
    const { showConfirm } = useAlertDialog();
    const isPremium = useIsPremium();

    // Memoize the color calculation
    const categoryIndicatorColor = React.useMemo(
      () => category.color || theme.colors.primaryContainer,
      [category.color, theme.colors.primaryContainer]
    );

    // Memoize the master press handler
    const handleMasterPress = React.useCallback(() => {
      if (!isPremium) {
        showConfirm({
          title: 'Premium Feature',
          message:
            'Master challenges are available for premium users only. Would you like to upgrade to premium?',
          confirmText: 'Upgrade',
          cancelText: 'Not Now',
          onConfirm: () => {
            router.push('/(app)/premium');
          },
        });
      } else {
        onPressMaster?.(category);
      }
    }, [isPremium, showConfirm, onPressMaster, category]);

    // Memoize the practice press handler
    const handlePracticePress = React.useCallback(() => {
      onPressPractice(category);
    }, [onPressPractice, category]);

    return (
      <Surface
        style={[styles.surface, { backgroundColor: theme.colors.background }]}
        elevation={0}
      >
        <View style={styles.container}>
          <View
            style={[
              styles.colorIndicator,
              { backgroundColor: categoryIndicatorColor },
            ]}
          />
          <View style={styles.content}>
            <CustomText variant='titleMedium' style={styles.title}>
              {category.name}
            </CustomText>
            {category.description && (
              <CustomText variant='bodyMedium' style={styles.description}>
                {category.description}
              </CustomText>
            )}
            <View style={styles.buttonsContainer}>
              <Button
                mode='contained'
                onPress={handlePracticePress}
                style={[
                  styles.button,
                  { backgroundColor: theme.colors.primary },
                ]}
                labelStyle={styles.buttonLabel}
                icon='cards-outline'
              >
                Practice
              </Button>
              {onPressMaster && (
                <Button
                  mode='contained'
                  onPress={handleMasterPress}
                  style={[
                    styles.button,
                    {
                      backgroundColor: theme.colors.secondary,
                    },
                  ]}
                  labelStyle={[
                    styles.buttonLabel,
                    {
                      color: theme.colors.onSecondary,
                    },
                  ]}
                  icon={isPremium ? 'clipboard-text-search-outline' : 'lock'}
                >
                  Master
                </Button>
              )}
            </View>
          </View>
        </View>
      </Surface>
    );
  }
);

CategoryCard.displayName = 'CategoryCard';

const styles = StyleSheet.create({
  surface: {
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  colorIndicator: {
    width: 10,
    height: '100%',
    borderRadius: 5,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    textAlign: 'left',
    opacity: 0.7,
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexShrink: 1,
  },
  buttonLabel: {
    fontSize: 14,
  },
});

export default CategoryCard;
