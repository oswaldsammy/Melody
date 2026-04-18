import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ClientProfile() {
  const profile = useAuthStore((s) => s.profile);
  const clear = useAuthStore((s) => s.clear);

  async function handleSignOut() {
    await supabase.auth.signOut();
    clear();
  }

  return (
    <View className="flex-1 bg-bg-primary px-6 pt-14">
      <Text className="text-text-primary text-2xl font-bold mb-6">Profile</Text>

      {/* Avatar placeholder + name */}
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-indigo-500/20 items-center justify-center mb-3">
          <Text className="text-3xl">👤</Text>
        </View>
        <Text className="text-text-primary text-xl font-semibold">{profile?.full_name}</Text>
        <Text className="text-text-muted text-sm mt-1">{profile?.location ?? 'No location set'}</Text>
      </View>

      <Card className="mb-4">
        <View className="flex-row justify-between py-1">
          <Text className="text-text-muted">Role</Text>
          <Text className="text-text-primary font-medium capitalize">{profile?.role}</Text>
        </View>
        {profile?.location ? (
          <View className="flex-row justify-between py-1 mt-1">
            <Text className="text-text-muted">Location</Text>
            <Text className="text-text-primary">{profile.location}</Text>
          </View>
        ) : null}
      </Card>

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
