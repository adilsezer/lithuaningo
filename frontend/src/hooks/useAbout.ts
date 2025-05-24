import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAlertDialog } from '@hooks/useAlertDialog';

export interface AboutLink {
  type: 'email' | 'url' | 'internal';
  value: string;
  label: string;
}

export const ABOUT_LINKS = {
  email: {
    type: 'email' as const,
    value: 'lithuaningo@gmail.com',
    label: 'Contact Support',
  },
  privacyPolicy: {
    type: 'internal' as const,
    value: '/privacy-policy',
    label: 'Privacy Policy',
  },
  termsOfService: {
    type: 'internal' as const,
    value: '/terms-of-service',
    label: 'Terms of Service',
  },
};

export const useAbout = () => {
  const router = useRouter();
  const { showError } = useAlertDialog();

  const handleLinkPress = useCallback(
    async (link: AboutLink) => {
      try {
        switch (link.type) {
          case 'email': {
            const emailUrl = `mailto:${link.value}`;
            const canOpenEmail = await Linking.canOpenURL(emailUrl);
            if (canOpenEmail) {
              await Linking.openURL(emailUrl);
            } else {
              throw new Error('No email app configured');
            }
            break;
          }

          case 'url': {
            const canOpenUrl = await Linking.canOpenURL(link.value);
            if (canOpenUrl) {
              await Linking.openURL(link.value);
            } else {
              throw new Error('Cannot open URL');
            }
            break;
          }

          case 'internal':
            router.push(link.value);
            break;

          default:
            throw new Error('Unsupported link type');
        }
      } catch (error) {
        console.error('Failed to handle link:', error);
        showError(
          error instanceof Error
            ? error.message
            : 'Failed to open link. Please try again later.',
        );
      }
    },
    [router, showError],
  );

  const navigateToPrivacyPolicy = useCallback(() => {
    handleLinkPress(ABOUT_LINKS.privacyPolicy);
  }, [handleLinkPress]);

  const navigateToTermsOfService = useCallback(() => {
    handleLinkPress(ABOUT_LINKS.termsOfService);
  }, [handleLinkPress]);

  return {
    links: ABOUT_LINKS,
    handleLinkPress,
    navigateToPrivacyPolicy,
    navigateToTermsOfService,
  };
};
