import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBooking, useCompleteBooking, useCancelBooking } from '@/hooks/useBookings';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/stripe';
import { useQueryClient } from '@tanstack/react-query';

export default function MusicianBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: booking, isLoading } = useBooking(id);
  const completeMutation = useCompleteBooking();
  const cancelMutation = useCancelBooking();

  if (isLoading) return <ActivityIndicator className="flex-1 mt-20" color="#7C3AED" />;
  if (!booking) return <Text className="flex-1 text-center mt-20 text-muted">Not found</Text>;

  async function handleConfirm() {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/confirm-booking`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id }),
      }
    );
    if (res.ok) {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert('Confirmed!', 'The client will be notified.');
    } else {
      Alert.alert('Error', (await res.json()).error);
    }
  }

  async function handleDecline() {
    Alert.alert('Decline Booking', 'This will decline and release the payment hold.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => cancelMutation.mutateAsync(id) },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-primary">← Back</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold mb-1">{booking.event_type}</Text>
      <Text className="text-muted mb-4">Client: {(booking as any).client?.full_name}</Text>

      <View className="bg-surface rounded-2xl p-4 mb-4 gap-2">
        <Row label="Date" value={new Date(booking.event_date).toLocaleString()} />
        <Row label="Duration" value={`${booking.duration_hours}h`} />
        <Row label="Location" value={booking.location} />
        <Row label="Status" value={booking.status.toUpperCase()} />
        {booking.notes && <Row label="Notes" value={booking.notes} />}
      </View>

      <View className="bg-surface rounded-2xl p-4 mb-6">
        <Text className="font-semibold mb-2">Your Earnings</Text>
        <Row label="Your payout" value={formatCurrency(booking.musician_payout)} bold />
      </View>

      {booking.status === 'pending' && (
        <View className="gap-3">
          <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center" onPress={handleConfirm}>
            <Text className="text-white font-bold">Accept Booking</Text>
          </TouchableOpacity>
          <TouchableOpacity className="border border-red-300 rounded-2xl py-4 items-center" onPress={handleDecline}>
            <Text className="text-red-500 font-semibold">Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {booking.status === 'confirmed' && (
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center"
          onPress={() => completeMutation.mutateAsync(id)}
        >
          <Text className="text-white font-bold">Mark as Completed</Text>
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
