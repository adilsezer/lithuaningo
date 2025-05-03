import React, { useEffect, useRef } from "react";
import { useUserStore } from "@stores/useUserStore";
import { useRouter } from "expo-router";
import { updateAuthState } from "@services/auth/authService";
import { useAlertActions } from "@stores/useAlertStore";
import { supabase } from "@services/supabase/supabaseClient";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useSetLoading } from "@stores/useUIStore";

/**
 * Service component that listens to Supabase authentication state changes
 * and updates the app state accordingly.
 */
const AuthInitializer: React.FC = () => {
  const { logOut } = useUserStore();
  const { showAlert } = useAlertActions();
  const router = useRouter();
  const setLoading = useSetLoading();
  const isUpdatingRef = useRef(false);

  const handleAuthStateUpdate = async (session: Session | null) => {
    if (isUpdatingRef.current) {
      return;
    }

    try {
      isUpdatingRef.current = true;
      setLoading(true);

      if (session) {
        await updateAuthState(session);
        // Navigation will be handled by the useProtectedRoutes hook
      } else {
        logOut();
        // Navigation will be handled by the useProtectedRoutes hook
      }
    } catch (error) {
      console.error("[Auth] State update failed:", error);
      showAlert({
        title: "Authentication Error",
        message:
          "There was a problem with your authentication. Please try again.",
        buttons: [{ text: "OK", onPress: () => router.replace("/auth/login") }],
      });
    } finally {
      isUpdatingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Show loading while initializing auth
    setLoading(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        await handleAuthStateUpdate(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [logOut, router, showAlert]);

  useEffect(() => {
    // Get the initial session when the component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateAuthState(session);
      }
      // Done loading initial session
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const refreshToken = async () => {
      try {
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
      } catch (error) {
        console.error("Unexpected error during token refresh:", error);
      }
    };

    // Refresh token every 23 hours
    const interval = setInterval(refreshToken, 23 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [logOut]);

  return null;
};

export default AuthInitializer;
