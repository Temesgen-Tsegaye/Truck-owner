import { use, createContext, type PropsWithChildren, useEffect } from 'react';

import { useSessionStore } from '@/store/session-store';
import { useUserStore } from '@/store/user-store';

export function isValidToken(token: string): boolean {
  // Basic validation: reject 'xxx' placeholder and check for JWT-like structure
  if (token === 'xxx') return false;
  
  // JWT tokens have three parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be non-empty
  return parts.every(part => part.length > 0);
}

const AuthContext = createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// Use this hook to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const { token, isLoading, setToken, clearToken, initialize } = useSessionStore();
  const { clearUser } = useUserStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          if (!isValidToken(token)) {
            console.error('Invalid token provided');
            return;
          }
          setToken(token);
        },
        signOut: () => {
          clearToken();
          clearUser();
        },
        session: token,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
