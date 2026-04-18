import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';

export default function ClientMessages() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <ActivityIndicator color="#6366F1" />
    </View>
  );

  return (
    <View className="flex-1 bg-bg-primary">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold">Messages</Text>
      </View>
      <FlatList
        data={conversations ?? []}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <Text className="text-4xl mb-4">💬</Text>
            <Text className="text-text-muted text-base">No conversations yet</Text>
            <Text className="text-text-muted text-sm mt-1">Book a musician to start chatting</Text>
          </View>
        }
        renderItem={({ item }) => {
          const other = profile?.role === 'client' ? (item as any).musician?.profile : (item as any).client;
          return (
            <TouchableOpacity
              className="bg-bg-surface border border-border-default rounded-2xl px-4 py-3 flex-row items-center"
              onPress={() => router.push(`/(client)/messages/${item.id}`)}
              activeOpacity={0.7}
            >
              <View className="w-11 h-11 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
                <Text className="text-xl">🎵</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary">{other?.full_name ?? 'Musician'}</Text>
                <Text className="text-text-muted text-sm mt-0.5">Tap to open conversation</Text>
              </View>
              <Text className="text-text-muted">›</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
