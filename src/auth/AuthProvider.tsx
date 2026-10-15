import type { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Profile = Tables<'profiles'>;
type Status = 'loading' | 'error' | 'signedOut' | 'onboarding' | 'ready';
type AuthState = {
  status: Status;
  session: Session | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadProfile = useCallback(async (s: Session | null) => {
    setFailed(false);
    if (!s) return setProfile(null);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', s.user.id).single();
    if (error) setFailed(true);
    setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session);
      setSessionLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Supabase recomienda no llamar a la API dentro del callback directamente.
      setTimeout(() => loadProfile(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const status: Status = !sessionLoaded
    ? 'loading'
    : !session
      ? 'signedOut'
      : failed
        ? 'error'
        : profile?.id !== session.user.id
          ? 'loading'
          : profile.main_currency
            ? 'ready'
            : 'onboarding';

  const refreshProfile = useCallback(() => loadProfile(session), [loadProfile, session]);

  return (
    <AuthContext.Provider value={{ status, session, profile, refreshProfile }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
