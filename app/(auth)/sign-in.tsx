import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  }

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-primary mb-2">Melody</Text>
      <Text className="text-muted mb-8">Sign in to hire musicians</Text>

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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center"
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Sign In</Text>
        )}
      </TouchableOpacity>

      <Link href="/(auth)/sign-up" asChild>
        <TouchableOpacity className="mt-4 items-center">
          <Text className="text-muted">Don't have an account? <Text className="text-primary font-semibold">Sign up</Text></Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
