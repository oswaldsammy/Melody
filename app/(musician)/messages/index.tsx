import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useMessages';

export default function MusicianMessages() {
  const router = useRouter();
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
          </View>
        }
        renderItem={({ item }) => {
          const client = (item as any).client;
          return (
            <TouchableOpacity
              className="bg-bg-surface border border-border-default rounded-2xl px-4 py-3 flex-row items-center"
              onPress={() => router.push(`/(musician)/messages/${item.id}`)}
              activeOpacity={0.7}
            >
              <View className="w-11 h-11 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
                <Text className="text-xl">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-text-primary">{client?.full_name ?? 'Client'}</Text>
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
