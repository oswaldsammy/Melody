import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useMusicianProfile } from '@/hooks/useMusicians';
import { formatCurrency } from '@/lib/stripe';
import { calculateFees } from '@/constants/commission';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const EVENT_TYPES = ['Wedding', 'Corporate Event', 'Birthday Party', 'Concert', 'Private Party', 'Restaurant', 'Bar / Venue', 'Lesson', 'Recording Session', 'Other'];

export default function NewBooking() {
  const router = useRouter();
  const { musicianId } = useLocalSearchParams<{ musicianId: string }>();
  const { data: musician } = useMusicianProfile(musicianId);

  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [durationHours, setDurationHours] = useState('2');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const quotedAmount = musician ? Math.round(musician.hourly_rate * parseFloat(durationHours || '0')) : 0;
  const { platformFee, musicianPayout } = calculateFees(quotedAmount);

  async function handleBook() {
    if (!eventType || !eventDate || !location) {
      Alert.alert('Missing fields', 'Please fill in event type, date, and location.');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-booking-intent`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            musician_id: musicianId,
            event_type: eventType,
            event_date: eventDate,
            duration_hours: parseFloat(durationHours),
            location,
            notes,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      Alert.alert('Request Sent!', 'The musician will confirm your booking shortly.', [
        { text: 'OK', onPress: () => router.replace('/(client)/bookings') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-primary" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-brand-primary font-medium">← Back</Text>
        </TouchableOpacity>

        <Text className="text-text-primary text-3xl font-bold mb-1">Request Booking</Text>
        {musician && (
          <Text className="text-text-muted text-base mb-8">with {musician.profile?.full_name}</Text>
        )}

        {/* Event type chips */}
        <Text className="text-text-muted text-xs font-medium uppercase tracking-widest mb-3">Event Type *</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {EVENT_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              className={`px-3 py-2 rounded-full border ${
                eventType === t
                  ? 'border-brand-primary bg-indigo-500/10'
                  : 'border-border-default bg-bg-surface'
              }`}
              onPress={() => setEventType(t)}
            >
              <Text className={`text-sm font-medium ${eventType === t ? 'text-brand-primary' : 'text-text-muted'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Date & Time * (YYYY-MM-DD HH:MM)"
          placeholder="2025-08-15 18:00"
          value={eventDate}
          onChangeText={setEventDate}
        />
        <Input
          label="Duration (hours) *"
          placeholder="2"
          value={durationHours}
          onChangeText={setDurationHours}
          keyboardType="decimal-pad"
        />
        <Input
          label="Location *"
          placeholder="Venue name and address"
          value={location}
          onChangeText={setLocation}
        />
        <Input
          label="Notes (optional)"
          placeholder="Song requests, special requirements..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ height: 80 }}
        />

        {/* Price breakdown */}
        <Card className="mb-6">
          <Text className="text-text-primary font-semibold mb-3">Price Estimate</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-muted">Musician fee</Text>
            <Text className="text-text-primary">{formatCurrency(musicianPayout)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-muted">Platform fee (15%)</Text>
            <Text className="text-text-primary">{formatCurrency(platformFee)}</Text>
          </View>
          <View className="h-px bg-border-default my-2" />
          <View className="flex-row justify-between">
            <Text className="text-text-primary font-semibold">Total</Text>
            <Text className="text-brand-primary font-bold text-lg">{formatCurrency(quotedAmount)}</Text>
          </View>
        </Card>

        <Button label="Send Booking Request" onPress={handleBook} loading={loading} size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
