import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useClientBookings } from '@/hooks/useBookings';
import { Badge } from '@/components/ui/Badge';
import type { Booking } from '@/types/database';

export default function ClientBookings() {
  const router = useRouter();
  const { data: bookings, isLoading } = useClientBookings();

  if (isLoading) return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <ActivityIndicator color="#6366F1" />
    </View>
  );

  return (
    <View className="flex-1 bg-bg-primary">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold">My Bookings</Text>
      </View>
      <FlatList
        data={bookings ?? []}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View className="items-center mt-16">
            <Text className="text-4xl mb-4">📅</Text>
            <Text className="text-text-muted text-base">No bookings yet</Text>
            <Text className="text-text-muted text-sm mt-1">Find a musician to get started</Text>
          </View>
        }
        renderItem={({ item }: { item: Booking }) => (
          <TouchableOpacity
            className="bg-bg-surface border border-border-default rounded-2xl p-4"
            onPress={() => router.push(`/(client)/bookings/${item.id}`)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold text-text-primary text-base flex-1 mr-2">
                {(item as any).musician?.profile?.full_name ?? 'Musician'}
              </Text>
              <Badge label={item.status} variant={item.status as any} />
            </View>
            <Text className="text-text-muted text-sm">{item.event_type}</Text>
            <Text className="text-text-muted text-xs mt-1">
              {new Date(item.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            {item.location ? <Text className="text-text-muted text-xs mt-0.5">{item.location}</Text> : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
