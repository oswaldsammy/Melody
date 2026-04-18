import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBooking, useCompleteBooking, useCancelBooking } from '@/hooks/useBookings';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/stripe';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MusicianBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: booking, isLoading } = useBooking(id);
  const completeMutation = useCompleteBooking();
  const cancelMutation = useCancelBooking();

  if (isLoading) return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <ActivityIndicator color="#6366F1" />
    </View>
  );
  if (!booking) return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <Text className="text-text-muted">Booking not found</Text>
    </View>
  );

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
      Alert.alert('Confirmed!', 'The client has been notified.');
    } else {
      Alert.alert('Error', (await res.json()).error);
    }
  }

  function handleDecline() {
    Alert.alert('Decline Booking', 'This will decline and release the payment hold.', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Decline', style: 'destructive', onPress: () => cancelMutation.mutateAsync(id) },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-bg-primary" contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-brand-primary font-medium">← Back</Text>
      </TouchableOpacity>

      <View className="flex-row items-start justify-between mb-1">
        <Text className="text-text-primary text-2xl font-bold flex-1 mr-3">{booking.event_type}</Text>
        <Badge label={booking.status} variant={booking.status as any} />
      </View>
      <Text className="text-text-muted mb-6">Client: {(booking as any).client?.full_name}</Text>

      <Card className="mb-4">
        <Text className="text-text-primary font-semibold mb-3">Event Details</Text>
        <Row label="Date" value={new Date(booking.event_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })} />
        <Row label="Duration" value={`${booking.duration_hours} hour${booking.duration_hours !== 1 ? 's' : ''}`} />
        <Row label="Location" value={booking.location} />
        {booking.notes ? <Row label="Notes" value={booking.notes} /> : null}
      </Card>

      <Card className="mb-6">
        <Text className="text-text-primary font-semibold mb-3">Your Earnings</Text>
        <Row label="Your payout" value={formatCurrency(booking.musician_payout)} bold />
      </Card>

      {booking.status === 'pending' && (
        <View className="gap-3">
          <Button label="Accept Booking" onPress={handleConfirm} />
          <Button label="Decline" variant="destructive" onPress={handleDecline} loading={cancelMutation.isPending} />
        </View>
      )}

      {booking.status === 'confirmed' && (
        <Button
          label="Mark as Completed"
          onPress={() => completeMutation.mutateAsync(id)}
          loading={completeMutation.isPending}
        />
      )}
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-text-muted">{label}</Text>
      <Text className={`flex-1 text-right ml-4 ${bold ? 'font-bold text-brand-primary' : 'text-text-primary'}`}>{value}</Text>
    </View>
  );
}
