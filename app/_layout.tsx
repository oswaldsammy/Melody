import '../global.css';
import { useEffect } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

const queryClient = new QueryClient();

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { session, profile, setSession, clear } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else clear();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;

    if (session === null) {
      router.replace('/(auth)/sign-in');
      return;
    }
    if (session && !profile) return;

    const inAuth = segments[0] === '(auth)';
    if (!profile && !inAuth) {
      router.replace('/(auth)/sign-in');
    } else if (profile && inAuth) {
      router.replace(profile.role === 'musician' ? '/(musician)/dashboard' : '/(client)/explore');
    }
  }, [session, profile, segments, navigationState?.key]);

  return <Slot />;
}

async function fetchProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (data) useAuthStore.getState().setProfile(data);
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthGate />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
