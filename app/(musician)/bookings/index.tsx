import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMusicianBookings } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/stripe';

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-50',
  confirmed: 'text-green-700 bg-green-50',
  completed: 'text-blue-700 bg-blue-50',
  cancelled: 'text-gray-500 bg-gray-50',
  disputed: 'text-red-600 bg-red-50',
};

export default function MusicianBookings() {
  const router = useRouter();
  const { data: bookings, isLoading } = useMusicianBookings();

  if (isLoading) return <ActivityIndicator className="flex-1 mt-20" color="#7C3AED" />;

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-white px-4 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Bookings</Text>
      </View>
      <FlatList
        data={bookings ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text className="text-center text-muted mt-8">No bookings yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 shadow-sm"
            onPress={() => router.push(`/(musician)/bookings/${item.id}`)}
          >
            <View className="flex-row justify-between items-start mb-1">
              <Text className="font-semibold text-gray-900">{(item as any).client?.full_name}</Text>
              <View className={`px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status].split(' ')[1]}`}>
                <Text className={`text-xs font-medium capitalize ${STATUS_COLOR[item.status].split(' ')[0]}`}>{item.status}</Text>
              </View>
            </View>
            <Text className="text-muted text-sm">{item.event_type} · {new Date(item.event_date).toLocaleDateString()}</Text>
            <Text className="text-primary font-medium mt-1">{formatCurrency(item.musician_payout)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
