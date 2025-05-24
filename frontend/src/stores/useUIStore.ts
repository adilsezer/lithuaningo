import { create } from 'zustand';

export interface UIState {
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// Typed selectors
export const useIsLoading = () => useUIStore((state) => state.isLoading);
export const useError = () => useUIStore((state) => state.error);
export const useSetLoading = () => useUIStore((state) => state.setLoading);
export const useSetError = () => useUIStore((state) => state.setError);

export default useUIStore;
