import { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    <KeyboardAvoidingView className="flex-1 bg-bg-primary" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-8 justify-between">

          <View>
            <View className="w-12 h-12 rounded-xl bg-brand-primary items-center justify-center mb-8">
              <Text className="text-text-primary text-2xl">🎧</Text>
            </View>
            <Text className="text-text-primary text-4xl font-bold mb-1">Almost there</Text>
            <Text className="text-text-muted text-base mb-10">Help musicians know where to find you</Text>

            <Input
              label="Phone (optional)"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Location"
              placeholder="City, State"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View>
            <Button label="Get Started" onPress={handleSave} loading={loading} size="lg" />
            <Text className="text-text-muted text-xs text-center mt-4">You can update this later in your profile</Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
