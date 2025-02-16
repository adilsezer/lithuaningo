import React, { useEffect } from "react";
import { useUserStore } from "@stores/useUserStore";
import { useRouter } from "expo-router";
import { updateAuthState } from "@services/auth/authService";
import { useAlertActions } from "@stores/useAlertStore";
import { supabase } from "@services/supabase/supabaseClient";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
/**
 * Service component that listens to Supabase authentication state changes
 * and updates the app state accordingly.
 */
const AuthInitializer: React.FC = () => {
  const { logOut } = useUserStore();
  const { showAlert } = useAlertActions();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        try {
          if (event === "SIGNED_IN" || event === "USER_UPDATED") {
            if (session) {
              await updateAuthState(session);
            }
          } else if (event === "SIGNED_OUT") {
            logOut();
            router.replace("/");
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          showAlert({
            title: "Authentication Error",
            message:
              "There was a problem with your authentication. Please try again.",
            buttons: [
              { text: "OK", onPress: () => router.replace("/auth/login") },
            ],
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [logOut, router, showAlert]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateAuthState(session);
      }
    });
  }, []);

  useEffect(() => {
    const refreshToken = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing token:", error);
        logOut();
      } else if (session) {
        await updateAuthState(session);
      }
    };

    // Refresh token every 23 hours
    const interval = setInterval(refreshToken, 23 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [logOut]);

  return null;
};

export default AuthInitializer;
