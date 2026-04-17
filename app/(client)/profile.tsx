import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

export default function ClientProfile() {
  const profile = useAuthStore((s) => s.profile);
  const clear = useAuthStore((s) => s.clear);

  async function handleSignOut() {
    await supabase.auth.signOut();
    clear();
  }

  return (
    <View className="flex-1 bg-surface px-6 pt-14">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

      <View className="bg-white rounded-2xl p-5 mb-4">
        <Text className="text-lg font-semibold">{profile?.full_name}</Text>
        <Text className="text-muted">{profile?.location ?? 'No location set'}</Text>
      </View>

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
