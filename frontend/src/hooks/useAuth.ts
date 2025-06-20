import { useCallback } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useUserStore } from "@stores/useUserStore";
import { useAuthOperation } from "@hooks/useAuthOperation";
import { AuthResponse } from "@src/types/auth.types";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  signUpWithGoogle,
  signUpWithApple,
  signOut,
  updateProfile,
  updatePassword,
  resetPassword,
  deleteAccount,
  verifyEmail as verifyEmailService,
  resendOTP,
  verifyPasswordReset,
} from "@services/auth/authService";

export type SocialProvider = "google" | "apple";

export const useAuth = () => {
  const { performAuthOperation } = useAuthOperation();
  const { showAlert, showConfirm } = useAlertDialog();
  const router = useRouter();

  // Navigation helpers
  const navigateAfterAuth = useCallback(
    (route: string) => {
      router.replace(route);
    },
    [router]
  );

  const navigateToVerification = useCallback(
    (email: string) => {
      router.push({
        pathname: "/auth/email-verification",
        params: { email },
      });
    },
    [router]
  );

  // Authentication methods
  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await performAuthOperation(async () => {
        const response = await signUpWithEmail(email, password, name);
        if (response.success) {
          showAlert({
            title: "Verification Required",
            message: "Please check your email for the verification code.",
            buttons: [
              {
                text: "OK",
                onPress: () => navigateToVerification(email),
              },
            ],
          });
        }
        return response;
      }, "Sign Up Failed");
      return result;
    },
    [performAuthOperation, showAlert, navigateToVerification]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await performAuthOperation(async () => {
        const response = await signInWithEmail(email, password);

        if (response.success) {
          navigateAfterAuth("/(app)");
          return response;
        }

        if (response.code === "EMAIL_NOT_VERIFIED") {
          const emailToVerify = response.email ?? email;

          navigateToVerification(emailToVerify);

          showAlert({
            title: "Email Not Verified",
            message: "Please verify your email before logging in.",
            buttons: [{ text: "OK", onPress: () => {} }],
          });
        }

        return response;
      }, "Login Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth, showAlert, navigateToVerification]
  );

  // Social auth for signup (sets terms_accepted: true)
  const signUpWithSocial = useCallback(
    async (provider: SocialProvider) => {
      const result = await performAuthOperation(async () => {
        let response;
        if (provider === "google") {
          response = await signUpWithGoogle();
        } else if (provider === "apple" && Platform.OS === "ios") {
          response = await signUpWithApple();
        } else {
          console.error(
            `[useAuth] signUpWithSocial: Unsupported provider or platform for ${provider}`
          );
          throw new Error(`Unsupported provider or platform for ${provider}`);
        }

        if (response.success) {
          navigateAfterAuth("/(app)");
        }
        return response;
      }, `${provider} Signup Failed`);
      return result;
    },
    [performAuthOperation, navigateAfterAuth]
  );

  // Social auth for login (checks terms_accepted)
  const signInWithSocial = useCallback(
    async (provider: SocialProvider) => {
      // Handle TERMS_REQUIRED outside of performAuthOperation to avoid generic error handling
      try {
        let response: AuthResponse;
        if (provider === "google") {
          response = await signInWithGoogle();
        } else if (provider === "apple" && Platform.OS === "ios") {
          response = await signInWithApple();
        } else {
          console.error(
            `[useAuth] signInWithSocial: Unsupported provider or platform for ${provider}`
          );
          throw new Error(`Unsupported provider or platform for ${provider}`);
        }

        if (response.success) {
          navigateAfterAuth("/(app)");
          return response;
        } else if (response.code === "TERMS_REQUIRED") {
          // Show alert guiding user to signup
          console.log(
            "[useAuth] Showing TERMS_REQUIRED alert with custom buttons"
          );
          showAlert({
            title: "Terms Required",
            message:
              response.message ||
              "Please use the signup page to agree to our Terms of Service and Privacy Policy.",
            buttons: [
              {
                text: "SignUp",
                onPress: () => {
                  console.log(
                    "[useAuth] SignUp button pressed, navigating to signup"
                  );
                  router.push("/auth/signup");
                },
              },
              {
                text: "Cancel",
                onPress: () => {
                  console.log("[useAuth] Cancel button pressed");
                },
              },
            ],
          });
          return response;
        } else {
          // For other failures, use performAuthOperation for consistent error handling
          const result = await performAuthOperation(async () => {
            return response;
          }, `${provider} Login Failed`);
          return result;
        }
      } catch (error) {
        // For unexpected errors, use performAuthOperation for consistent error handling
        const result = await performAuthOperation(async () => {
          throw error;
        }, `${provider} Login Failed`);
        return result;
      }
    },
    [performAuthOperation, navigateAfterAuth, showAlert, router]
  );

  const handleSignOut = useCallback(async () => {
    console.log("[useAuth] handleSignOut: Initiating sign-out process."); // Keep this high-level log
    const result = await performAuthOperation(async () => {
      const response = await signOut();
      if (response.success) {
        // crashlytics().log("User signed out");
        navigateAfterAuth("/");
      }
      return response;
    }, "Sign Out Failed");
    return result;
  }, [performAuthOperation, navigateAfterAuth]);

  // Profile management
  const handleUpdateProfile = useCallback(
    async (
      currentPassword: string,
      updates: { displayName?: string; email?: string }
    ) => {
      const result = await performAuthOperation(async () => {
        const response = await updateProfile(currentPassword, updates);
        if (response.success) {
          // Update user store with new display name
          if (updates.displayName) {
            useUserStore
              .getState()
              .updateUserData({ fullName: updates.displayName });
          }
          showAlert({
            title: "Success",
            message: "Your profile has been updated successfully.",
            buttons: [
              {
                text: "OK",
                onPress: () => navigateAfterAuth("/(app)/profile"),
              },
            ],
          });
        }
        return response;
      }, "Profile Update Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth, showAlert]
  );

  const handleUpdatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const result = await performAuthOperation(async () => {
        const response = await updatePassword(currentPassword, newPassword);
        if (response.success) {
          showAlert({
            title: "Success",
            message: "Your password has been updated successfully.",
            buttons: [
              {
                text: "OK",
                onPress: () => navigateAfterAuth("/(app)/profile"),
              },
            ],
          });
        }
        return response;
      }, "Password Update Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth, showAlert]
  );

  const handleResetPassword = useCallback(
    async (email: string) => {
      const result = await performAuthOperation(async () => {
        const response = await resetPassword(email);
        if (response.success) {
          showAlert({
            title: "Check Your Email",
            message:
              "If your account exists, we've sent you a code to reset your password.",
            buttons: [
              {
                text: "OK",
                onPress: () => {
                  router.push({
                    pathname: "/auth/password-reset-verification",
                    params: { email },
                  });
                },
              },
            ],
          });
        }
        return response;
      }, "Password Reset Failed");
      return result;
    },
    [performAuthOperation, showAlert, router]
  );

  const handleVerifyPasswordReset = useCallback(
    async (email: string, token: string, newPassword: string) => {
      const result = await performAuthOperation(async () => {
        const response = await verifyPasswordReset(email, token, newPassword);
        if (response.success) {
          showAlert({
            title: "Success",
            message: "Your password has been reset. You can now log in.",
            buttons: [
              { text: "OK", onPress: () => navigateAfterAuth("/auth/login") },
            ],
          });
        }
        return response;
      }, "Password Reset Verification Failed");
      return result;
    },
    [performAuthOperation, showAlert, navigateAfterAuth]
  );

  // Account management
  const handleDeleteAccount = useCallback(
    async (password?: string, authProvider?: string) => {
      return new Promise((resolve) => {
        showConfirm({
          title: "Confirm Deletion",
          message:
            authProvider === "email"
              ? "Are you sure you want to delete your account? This action cannot be undone."
              : `You'll need to verify your ${authProvider} account before deletion. Are you sure you want to proceed?`,
          confirmText: "Delete",
          cancelText: "Cancel",
          onConfirm: async () => {
            const result = await performAuthOperation(async () => {
              const response = await deleteAccount(password);
              if (response.success) {
                showAlert({
                  title: "Account Deleted",
                  message:
                    "Your account has been successfully deleted. We're sorry to see you go.",
                  buttons: [
                    {
                      text: "OK",
                      onPress: async () => {
                        if (response.cleanup) {
                          await response.cleanup();
                        }
                        navigateAfterAuth("/");
                      },
                    },
                  ],
                });
              }
              return response;
            }, "Account Deletion Failed");
            resolve(result);
          },
          onCancel: () => resolve({ success: false }),
        });
      });
    },
    [performAuthOperation, navigateAfterAuth, showAlert, showConfirm]
  );

  const verifyEmail = useCallback(
    async (email: string, token: string) => {
      const result = await performAuthOperation(async () => {
        const response = await verifyEmailService(email, token);
        if (response.success) {
          showAlert({
            title: "Success",
            message: "Your email has been verified. You can now log in.",
            buttons: [
              { text: "OK", onPress: () => navigateAfterAuth("/auth/login") },
            ],
          });
        }
        return response;
      }, "Email Verification Failed");
      return result;
    },
    [performAuthOperation, navigateAfterAuth, showAlert]
  );

  const resendVerificationCode = useCallback(
    async (email: string) => {
      const result = await performAuthOperation(async () => {
        const response = await resendOTP(email);
        if (response.success) {
          showAlert({
            title: "Code Sent",
            message: "A new verification code has been sent to your email.",
            buttons: [{ text: "OK", onPress: () => {} }],
          });
        }
        return response;
      }, "Resend Failed");
      return result.success;
    },
    [performAuthOperation, showAlert]
  );

  return {
    signUp,
    signIn,
    signInWithSocial,
    signUpWithSocial,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    resetPassword: handleResetPassword,
    verifyPasswordReset: handleVerifyPasswordReset,
    deleteAccount: handleDeleteAccount,
    verifyEmail,
    resendVerificationCode,
  };
};
