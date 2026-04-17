import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function MusicianProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const clear = useAuthStore((s) => s.clear);

  async function handleStripeSetup() {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-stripe-account-link`,
      { method: 'POST', headers: { Authorization: `Bearer ${session!.access_token}` } }
    );
    const { url, error } = await res.json();
    if (error) { Alert.alert('Error', error); return; }
    Linking.openURL(url);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    clear();
  }

  return (
    <View className="flex-1 bg-surface px-6 pt-14">
      <Text className="text-2xl font-bold text-gray-900 mb-6">My Profile</Text>

      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
        <Text className="text-lg font-semibold">{profile?.full_name}</Text>
        <Text className="text-muted">{profile?.location ?? 'No location set'}</Text>
      </View>

      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between"
        onPress={() => router.push('/(musician)/profile/edit')}
      >
        <Text className="font-medium">Edit Profile</Text>
        <Text className="text-muted">→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between"
        onPress={() => router.push('/(musician)/profile/media')}
      >
        <Text className="font-medium">Manage Photos & Audio</Text>
        <Text className="text-muted">→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-6 shadow-sm flex-row items-center justify-between"
        onPress={handleStripeSetup}
      >
        <Text className="font-medium">Stripe Payout Setup</Text>
        <Text className="text-muted">→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-red-300 rounded-2xl py-4 items-center"
        onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
        ])}
      >
        <Text className="text-red-500 font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
