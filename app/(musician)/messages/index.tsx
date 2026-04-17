import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useConversations } from '@/hooks/useMessages';

export default function MusicianMessages() {
  const router = useRouter();
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
          const client = (item as any).client;
          return (
            <TouchableOpacity
              className="bg-white rounded-2xl px-4 py-3 flex-row items-center shadow-sm"
              onPress={() => router.push(`/(musician)/messages/${item.id}`)}
            >
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                <Text className="text-lg">👤</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{client?.full_name ?? 'Client'}</Text>
                <Text className="text-muted text-sm">Tap to open</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
