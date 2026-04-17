import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';

export default function ClientMessages() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) return <ActivityIndicator className="flex-1 mt-20" color="#7C3AED" />;

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-white px-4 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Messages</Text>
      </View>
      <FlatList
        data={conversations ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={<Text className="text-center text-muted mt-8">No conversations yet</Text>}
        renderItem={({ item }) => {
          const other = profile?.role === 'client' ? (item as any).musician?.profile : (item as any).client;
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl px-4 py-3 flex-row items-center shadow-sm"
              onPress={() => router.push(`/(client)/messages/${item.id}`)}
            >
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                <Text className="text-lg">🎵</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{other?.full_name ?? 'Musician'}</Text>
                <Text className="text-muted text-sm" numberOfLines={1}>Tap to open conversation</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
