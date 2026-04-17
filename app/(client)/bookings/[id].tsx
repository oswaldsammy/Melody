import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBooking, useCompleteBooking, useCancelBooking } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/stripe';

export default function ClientBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: booking, isLoading } = useBooking(id);
  const completeMutation = useCompleteBooking();
  const cancelMutation = useCancelBooking();

  if (isLoading) return <ActivityIndicator className="flex-1 mt-20" color="#7C3AED" />;
  if (!booking) return <Text className="flex-1 text-center mt-20 text-muted">Not found</Text>;

  async function handleComplete() {
    Alert.alert('Mark as Complete', 'Confirm the event happened and release payment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Complete', onPress: async () => {
        await completeMutation.mutateAsync(id);
        router.push(`/(shared)/review/${id}`);
      }},
    ]);
  }

  async function handleCancel() {
    Alert.alert('Cancel Booking', 'This will cancel and release the payment hold.', [
      { text: 'Keep Booking', style: 'cancel' },
      { text: 'Cancel Booking', style: 'destructive', onPress: () => cancelMutation.mutateAsync(id) },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-primary">← Back</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold mb-1">{booking.event_type}</Text>
      <Text className="text-muted mb-4">with {(booking as any).musician?.profile?.full_name}</Text>

      <View className="bg-surface rounded-2xl p-4 mb-4 gap-2">
        <Row label="Date" value={new Date(booking.event_date).toLocaleString()} />
        <Row label="Duration" value={`${booking.duration_hours}h`} />
        <Row label="Location" value={booking.location} />
        <Row label="Status" value={booking.status.toUpperCase()} />
        {booking.notes && <Row label="Notes" value={booking.notes} />}
      </View>

      <View className="bg-surface rounded-2xl p-4 mb-6 gap-1">
        <Text className="font-semibold mb-2">Payment</Text>
        <Row label="Musician fee" value={formatCurrency(booking.musician_payout)} />
        <Row label="Platform fee" value={formatCurrency(booking.platform_fee)} />
        <View className="h-px bg-gray-200 my-1" />
        <Row label="Total" value={formatCurrency(booking.quoted_amount)} bold />
      </View>

      {booking.status === 'confirmed' && (
        <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center mb-3" onPress={handleComplete}>
          <Text className="text-white font-bold">Mark as Completed</Text>
        </TouchableOpacity>
      )}

      {['pending', 'confirmed'].includes(booking.status) && (
        <TouchableOpacity className="border border-red-300 rounded-2xl py-4 items-center" onPress={handleCancel}>
          <Text className="text-red-500 font-semibold">Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-muted">{label}</Text>
      <Text className={bold ? 'font-bold text-primary' : 'text-gray-900'}>{value}</Text>
    </View>
  );
}
