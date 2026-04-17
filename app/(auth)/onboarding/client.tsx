import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function ClientOnboarding() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!profile) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ phone, location })
      .eq('id', profile.id)
      .select()
      .single();
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setProfile(data);
    router.replace('/(client)/explore');
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-2xl font-bold mb-2">Complete your profile</Text>
      <Text className="text-muted mb-8">Help musicians know where to find you</Text>

      <Text className="text-sm font-medium text-gray-700 mb-1">Phone (optional)</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="+1 (555) 000-0000"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Text className="text-sm font-medium text-gray-700 mb-1">Location</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-8 text-base"
        placeholder="City, State"
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center"
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-base">Get Started</Text>}
      </TouchableOpacity>
    </View>
  );
}
