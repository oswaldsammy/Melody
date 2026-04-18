import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBooking, useCompleteBooking, useCancelBooking } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/stripe';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ClientBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  function handleComplete() {
    Alert.alert('Mark as Complete', 'Confirm the event happened and release payment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Complete', onPress: async () => {
        await completeMutation.mutateAsync(id);
        router.push(`/(shared)/review/${id}`);
      }},
    ]);
  }

  function handleCancel() {
    Alert.alert('Cancel Booking', 'This will cancel and release the payment hold.', [
      { text: 'Keep Booking', style: 'cancel' },
      { text: 'Cancel Booking', style: 'destructive', onPress: () => cancelMutation.mutateAsync(id) },
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
      <Text className="text-text-muted mb-6">with {(booking as any).musician?.profile?.full_name}</Text>

      <Card className="mb-4">
        <Text className="text-text-primary font-semibold mb-3">Event Details</Text>
        <Row label="Date" value={new Date(booking.event_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })} />
        <Row label="Duration" value={`${booking.duration_hours} hour${booking.duration_hours !== 1 ? 's' : ''}`} />
        <Row label="Location" value={booking.location} />
        {booking.notes ? <Row label="Notes" value={booking.notes} /> : null}
      </Card>

      <Card className="mb-6">
        <Text className="text-text-primary font-semibold mb-3">Payment</Text>
        <Row label="Musician fee" value={formatCurrency(booking.musician_payout)} />
        <Row label="Platform fee" value={formatCurrency(booking.platform_fee)} />
        <View className="h-px bg-border-default my-2" />
        <Row label="Total" value={formatCurrency(booking.quoted_amount)} bold />
      </Card>

      {booking.status === 'confirmed' && (
        <Button label="Mark as Completed" onPress={handleComplete} loading={completeMutation.isPending} className="mb-3" />
      )}
      {['pending', 'confirmed'].includes(booking.status) && (
        <Button label="Cancel Booking" variant="destructive" onPress={handleCancel} loading={cancelMutation.isPending} />
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
