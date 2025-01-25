import { useIsAuthenticated } from "@stores/useUserStore";

export const useRootLayout = () => {
  const isAuthenticated = useIsAuthenticated();

  return {
    isAuthenticated,
    redirectPath: isAuthenticated ? "/dashboard/(tabs)" : undefined,
  };
};
