import { create } from 'zustand';
import { UserProfileResponse } from '@/query/profile/types';

export type User = UserProfileResponse;

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (updates) => set((state) => ({ 
    user: state.user ? { ...state.user, ...updates } : null 
  })),
  clearUser: () => set({ user: null }),
}));

// Export store instance for use outside React components
export const userStore = useUserStore;
