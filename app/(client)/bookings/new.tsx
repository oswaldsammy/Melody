import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useMusicianProfile } from '@/hooks/useMusicians';
import { formatCurrency } from '@/lib/stripe';
import { calculateFees } from '@/constants/commission';

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
      Alert.alert('Please fill in all required fields');
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

      Alert.alert('Request Sent!', 'The musician will confirm your booking shortly.');
      router.replace('/(client)/bookings');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-primary">← Back</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold mb-1">Request Booking</Text>
      {musician && <Text className="text-muted mb-6">with {musician.profile?.full_name}</Text>}

      <Text className="text-sm font-medium text-gray-700 mb-2">Event Type *</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {EVENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            className={`px-3 py-1.5 rounded-full border ${eventType === t ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onPress={() => setEventType(t)}
          >
            <Text className={eventType === t ? 'text-primary text-sm font-medium' : 'text-gray-600 text-sm'}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-1">Date & Time * (YYYY-MM-DD HH:MM)</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="2025-08-15 18:00"
        value={eventDate}
        onChangeText={setEventDate}
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">Duration (hours) *</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="2"
        value={durationHours}
        onChangeText={setDurationHours}
        keyboardType="decimal-pad"
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">Location *</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="Venue name and address"
        value={location}
        onChangeText={setLocation}
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">Notes (optional)</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-6 text-base"
        placeholder="Song requests, special requirements..."
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <View className="bg-surface rounded-2xl p-4 mb-6">
        <Text className="font-semibold text-gray-900 mb-2">Price Estimate</Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-muted">Musician fee</Text>
          <Text>{formatCurrency(musicianPayout)}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-muted">Platform fee (15%)</Text>
          <Text>{formatCurrency(platformFee)}</Text>
        </View>
        <View className="h-px bg-gray-200 my-2" />
        <View className="flex-row justify-between">
          <Text className="font-semibold">Total</Text>
          <Text className="font-bold text-primary">{formatCurrency(quotedAmount)}</Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center"
        onPress={handleBook}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Send Booking Request</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
