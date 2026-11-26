import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { dataClient, subscribeAuthState } from '@/data';
import type { Role, Session, SignUpInput } from '@/data/types';

interface AuthContextValue {
  session: Session | null;
  user: Session['user'] | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Session>;
  signUp: (input: SignUpInput) => Promise<Session>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const applySession = useCallback(async (userId: string | null) => {
    if (!userId) {
      setSession(null);
      return;
    }
    try {
      const next = await dataClient.auth.getSession();
      setSession(next);
    } catch (error) {
      console.warn('[happypaw] Could not restore session.', error);
      setSession(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await dataClient.auth.getSession();
      setSession(next);
    } catch (error) {
      console.warn('[happypaw] Could not restore session.', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Keep the React session in sync with Supabase auth state (sign-in, sign-out,
  // token refresh, logins from other tabs).
  useEffect(() => {
    const unsubscribe = subscribeAuthState((userId) => {
      if (userId) {
        void applySession(userId);
      } else {
        setSession(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await dataClient.auth.signIn(email, password);
    setSession(next);
    return next;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const next = await dataClient.auth.signUp(input);
    setSession(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await dataClient.auth.signOut();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user.role ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      refresh,
    }),
    [session, loading, signIn, signUp, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export function roleHome(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'vet') return '/vet';
  return '/app';
}
