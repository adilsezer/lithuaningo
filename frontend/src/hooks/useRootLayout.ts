import { useAppSelector } from "@redux/hooks";
import { selectIsAuthenticated } from "@redux/slices/userSlice";

export const useRootLayout = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    isAuthenticated,
    redirectPath: isAuthenticated ? "/dashboard/(tabs)" : undefined,
  };
};
