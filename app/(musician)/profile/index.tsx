import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MusicianProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const clear = useAuthStore((s) => s.clear);

  async function handleSignOut() {
    await supabase.auth.signOut();
    clear();
  }

  return (
    <View className="flex-1 bg-bg-primary px-6 pt-14">
      <Text className="text-text-primary text-2xl font-bold mb-6">My Profile</Text>

      {/* Avatar + name */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-indigo-500/20 items-center justify-center mb-3">
          <Text className="text-3xl">🎸</Text>
        </View>
        <Text className="text-text-primary text-xl font-semibold">{profile?.full_name}</Text>
        <Text className="text-text-muted text-sm mt-1">{profile?.location ?? 'No location set'}</Text>
      </View>

      {/* Menu items */}
      <TouchableOpacity
        className="bg-bg-surface border border-border-default rounded-2xl p-4 mb-3 flex-row items-center justify-between"
        onPress={() => router.push('/(musician)/profile/edit')}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-3">
          <Text className="text-xl">✏️</Text>
          <Text className="text-text-primary font-medium">Edit Profile</Text>
        </View>
        <Text className="text-text-muted">›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-bg-surface border border-border-default rounded-2xl p-4 mb-6 flex-row items-center justify-between"
        onPress={() => router.push('/(musician)/profile/media')}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-3">
          <Text className="text-xl">🖼️</Text>
          <Text className="text-text-primary font-medium">Photos & Audio</Text>
        </View>
        <Text className="text-text-muted">›</Text>
      </TouchableOpacity>

      <Button
        label="Sign Out"
        variant="destructive"
        onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
        ])}
      />
    </View>
  );
}
