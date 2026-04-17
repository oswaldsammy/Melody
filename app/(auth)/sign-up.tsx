import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
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
      id: data.user.id,
      role,
      full_name: fullName,
    });

    setLoading(false);

    if (profileError) {
      Alert.alert('Error', profileError.message);
      return;
    }

    router.replace(role === 'musician' ? '/(auth)/onboarding/musician' : '/(auth)/onboarding/client');
  }

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-primary mb-2">Create Account</Text>
      <Text className="text-muted mb-8">Join Melody as a client or musician</Text>

      <Text className="text-sm font-medium text-gray-700 mb-2">I am a...</Text>
      <View className="flex-row mb-6 gap-3">
        {(['client', 'musician'] as UserRole[]).map((r) => (
          <TouchableOpacity
            key={r}
            className={`flex-1 py-3 rounded-xl border-2 items-center ${role === r ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onPress={() => setRole(r)}
          >
            <Text className={`font-semibold capitalize ${role === r ? 'text-primary' : 'text-gray-600'}`}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-6 text-base"
        placeholder="Password (min 8 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center"
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
