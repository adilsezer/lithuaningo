import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { useUserStore } from "@stores/useUserStore";
import { updateUserState } from "@services/user/userStateService";
import "react-native-url-polyfill/auto";

// Initialize the Supabase client with your Supabase URL and anon key
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase] Missing configuration:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  });
  throw new Error("Supabase configuration is missing");
}

console.log("[Supabase] Initializing client");
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("[Supabase] Auth state changed:", {
    event,
    hasSession: !!session,
  });

  const store = useUserStore.getState();

  if (event === "SIGNED_IN") {
    console.log("[Supabase] User signed in, updating store state only");
    if (session?.user) {
      store.logIn({
        id: session.user.id,
        email: session.user.email || "",
        fullName: session.user.user_metadata?.name || "",
        emailVerified: session.user.email_confirmed_at !== null,
        isAdmin: false,
        isPremium: false,
        premiumExpiresAt: undefined,
      });
    }
    store.setAuthenticated(true);
  } else if (event === "SIGNED_OUT") {
    console.log("[Supabase] User signed out, clearing state");
    store.setAuthenticated(false);
    store.logOut();
  } else if (event === "TOKEN_REFRESHED") {
    console.log("[Supabase] Token refreshed");
  } else if (event === "USER_UPDATED") {
    console.log("[Supabase] User updated, updating state");
    try {
      await updateUserState(session);
      console.log(
        "[Supabase] User state updated successfully after user update"
      );
    } catch (error) {
      console.error(
        "[Supabase] Failed to update user state after user update:",
        error
      );
    }
  }
});
