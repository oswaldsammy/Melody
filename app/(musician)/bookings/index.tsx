import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMusicianBookings } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/stripe';
import { Badge } from '@/components/ui/Badge';

export default function MusicianBookings() {
  const router = useRouter();
  const { data: bookings, isLoading } = useMusicianBookings();

  if (isLoading) return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <ActivityIndicator color="#6366F1" />
    </View>
  );

  return (
    <View className="flex-1 bg-bg-primary">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold">Bookings</Text>
      </View>
      <FlatList
        data={bookings ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <Text className="text-4xl mb-4">📅</Text>
            <Text className="text-text-muted text-base">No bookings yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-bg-surface border border-border-default rounded-2xl p-4"
            onPress={() => router.push(`/(musician)/bookings/${item.id}`)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold text-text-primary text-base flex-1 mr-2">
                {(item as any).client?.full_name ?? 'Client'}
              </Text>
              <Badge label={item.status} variant={item.status as any} />
            </View>
            <Text className="text-text-muted text-sm">{item.event_type}</Text>
            <Text className="text-text-muted text-xs mt-0.5">
              {new Date(item.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
            <Text className="text-brand-primary font-semibold mt-2">{formatCurrency(item.musician_payout)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
