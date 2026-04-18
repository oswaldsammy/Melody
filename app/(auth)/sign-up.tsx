import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/types/database';

export default function SignUp() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!fullName || !email || !password) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      setLoading(false);
      Alert.alert('Error', error?.message ?? 'Sign up failed');
      return;
    }
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, role, full_name: fullName,
    });
    setLoading(false);
    if (profileError) { Alert.alert('Error', profileError.message); return; }
    router.replace(role === 'musician' ? '/(auth)/onboarding/musician' : '/(auth)/onboarding/client');
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-primary" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-8 justify-between">

          <View>
            <Text className="text-text-primary text-4xl font-bold mb-1">Create account</Text>
            <Text className="text-text-muted text-base mb-10">Join Melody as a client or musician</Text>

            {/* Role selector */}
            <Text className="text-text-muted text-xs font-medium uppercase tracking-widest mb-3">I am a...</Text>
            <View className="flex-row gap-3 mb-6">
              {(['client', 'musician'] as UserRole[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${
                    role === r ? 'border-brand-primary bg-indigo-500/10' : 'border-border-default bg-bg-surface'
                  }`}
                >
                  <Text className="text-2xl mb-1">{r === 'client' ? '🎧' : '🎸'}</Text>
                  <Text className={`font-semibold capitalize text-sm ${role === r ? 'text-brand-primary' : 'text-text-muted'}`}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Full Name" placeholder="John Doe" value={fullName} onChangeText={setFullName} />
            <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Input label="Password" placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <View>
            <Button label="Create Account" onPress={handleSignUp} loading={loading} size="lg" />
            <View className="flex-row justify-center mt-6">
              <Text className="text-text-muted text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-brand-primary text-sm font-semibold">Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
