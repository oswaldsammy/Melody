import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useClientBookings } from '@/hooks/useBookings';
import type { Booking } from '@/types/database';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
  disputed: 'bg-red-100 text-red-700',
  in_progress: 'bg-purple-100 text-purple-700',
};

export default function ClientBookings() {
  const router = useRouter();
  const { data: bookings, isLoading } = useClientBookings();

  if (isLoading) return <ActivityIndicator className="flex-1 mt-20" color="#7C3AED" />;

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-white px-4 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
      </View>
      <FlatList
        data={bookings ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text className="text-center text-muted mt-8">No bookings yet</Text>}
        renderItem={({ item }: { item: Booking }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 shadow-sm"
            onPress={() => router.push(`/(client)/bookings/${item.id}`)}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-semibold text-gray-900">{(item as any).musician?.profile?.full_name}</Text>
              <View className={`px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status].split(' ')[0]}`}>
                <Text className={`text-xs font-medium capitalize ${STATUS_COLOR[item.status].split(' ')[1]}`}>{item.status}</Text>
              </View>
            </View>
            <Text className="text-muted text-sm">{item.event_type} · {new Date(item.event_date).toLocaleDateString()}</Text>
            <Text className="text-muted text-sm">{item.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
