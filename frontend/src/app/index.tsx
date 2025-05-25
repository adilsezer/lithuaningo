import { Redirect } from "expo-router";
import { useUserStore } from "@stores/useUserStore";

/**
 * Root index redirect - handles initial navigation based on auth state
 * If authenticated, go to the app route group
 * If not authenticated, go to the auth route group
 */
export default function Index() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // Redirect based on authentication state
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }
    return <Redirect href="/auth" />;

}
