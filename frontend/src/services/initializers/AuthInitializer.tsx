import React, { useEffect, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  hydrateUserSessionAndProfile,
  clearUserSessionAndLogout,
} from "../user/userProfileService";
import { useAlertActions } from "@stores/useAlertStore";
import { supabase } from "@services/supabase/supabaseClient";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useSetLoading } from "@stores/useUIStore";

/**
 * Service component that listens to Supabase authentication state changes
 * and updates the app state accordingly.
 */
const AuthInitializer: React.FC = () => {
  const { showAlert } = useAlertActions();
  const router = useRouter();
  const setLoading = useSetLoading();
  const activeProcessingId = useRef<string | null>(null);
  const isProcessingSessionUpdate = useRef<boolean>(false);
  const pendingSessionUpdate = useRef<Session | null | undefined>(undefined);
  const processLatestSessionUpdateRef = useRef<() => Promise<void>>();

  const processLatestSessionUpdate = useCallback(async () => {
    if (
      isProcessingSessionUpdate.current ||
      pendingSessionUpdate.current === undefined
    ) {
      return;
    }

    isProcessingSessionUpdate.current = true;
    const sessionToProcess = pendingSessionUpdate.current;
    pendingSessionUpdate.current = undefined;

    const sessionIdForLogging =
      sessionToProcess?.user?.id ||
      (sessionToProcess === null ? "null_session" : "undefined_session_state");
    activeProcessingId.current = sessionIdForLogging;

    try {
      if (sessionToProcess?.user) {
        const success = await hydrateUserSessionAndProfile(sessionToProcess);
        if (!success) {
          console.warn(
            `[AuthInitializer] hydrateUserSessionAndProfile failed for user: ${sessionToProcess.user.id}`
          );
        }
      } else {
        await clearUserSessionAndLogout();
      }
    } catch (error) {
      console.error(
        "[AuthInitializer] Critical error in processLatestSessionUpdate:",
        error
      );
      if (sessionToProcess !== null) {
        await clearUserSessionAndLogout();
      }
    } finally {
      activeProcessingId.current = null;
      isProcessingSessionUpdate.current = false;

      if (pendingSessionUpdate.current !== undefined) {
        Promise.resolve().then(processLatestSessionUpdate);
      }
    }
  }, []);

  // Store the latest version in a ref for stable access
  processLatestSessionUpdateRef.current = processLatestSessionUpdate;

  const handleSessionUpdate = useCallback(async (session: Session | null) => {
    pendingSessionUpdate.current = session;
    // Use ref to avoid dependency issues
    processLatestSessionUpdateRef.current?.();
  }, []);

  useEffect(() => {
    let initialCheckCompleted = false;
    console.log("[AuthInitializer] Setting up Supabase auth state listener.");
    setLoading(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(
          `[AuthInitializer] onAuthStateChange event: ${event}, session: ${
            session ? "exists" : "null"
          }`
        );

        if (session) {
          if (
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION" ||
            event === "TOKEN_REFRESHED"
          ) {
            handleSessionUpdate(session);
          } else if (event === "USER_UPDATED") {
            console.log(
              `[AuthInitializer] USER_UPDATED event for user: ${session.user.id}. No automatic profile refresh.`
            );
          }
        } else {
          handleSessionUpdate(null);
        }

        if (!initialCheckCompleted) {
          setLoading(false);
          initialCheckCompleted = true;
        }
      }
    );

    (async () => {
      if (initialCheckCompleted) {
        return;
      }
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        if (initialSession) {
          console.log(
            "[AuthInitializer] Initial session found via getSession."
          );
          handleSessionUpdate(initialSession);
        } else {
          console.log(
            "[AuthInitializer] No initial session found via getSession."
          );
          handleSessionUpdate(null);
        }
      } catch (e) {
        console.error(
          "[AuthInitializer] Error during explicit getSession check:",
          e
        );
        handleSessionUpdate(null);
      } finally {
        if (!initialCheckCompleted) {
          setLoading(false);
          initialCheckCompleted = true;
        }
      }
    })();

    return () => {
      console.log(
        "[AuthInitializer] Unsubscribing Supabase auth state listener."
      );
      subscription.unsubscribe();
    };
  }, [showAlert, router, setLoading, handleSessionUpdate]);

  useEffect(() => {
    const refreshToken = async () => {
      try {
        const {
          data: { session: refreshedSession },
          error,
        } = await supabase.auth.refreshSession();
        if (error) {
          console.warn(
            "[AuthInitializer] Error refreshing Supabase token:",
            error.message
          );
          if (
            error.message.includes("Invalid refresh token") ||
            error.status === 401 ||
            error.status === 403
          ) {
            console.warn(
              "[AuthInitializer] Invalid refresh token detected. Clearing session."
            );
            handleSessionUpdate(null);
          }
        } else if (refreshedSession) {
          // Token was refreshed successfully, session is already handled by auth state listener
        } else {
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          if (!currentSession) {
            console.log(
              "[AuthInitializer] No current session after token refresh attempt led to no new session. Clearing session."
            );
            handleSessionUpdate(null);
          }
        }
      } catch (error: unknown) {
        console.error(
          "[AuthInitializer] Unexpected error during Supabase token refresh:",
          error
        );
        if (
          error &&
          typeof error === "object" &&
          (("message" in error &&
            typeof error.message === "string" &&
            error.message.includes("Invalid refresh token")) ||
            ("status" in error &&
              (error.status === 401 || error.status === 403)))
        ) {
          console.warn(
            "[AuthInitializer] Unexpected error indicates invalid token. Clearing session."
          );
          handleSessionUpdate(null);
        }
      }
    };

    const interval = setInterval(refreshToken, 23 * 60 * 60 * 1000);

    const timerId = setTimeout(() => {
      refreshToken();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timerId);
    };
  }, [handleSessionUpdate]);

  return null;
};

export default AuthInitializer;
