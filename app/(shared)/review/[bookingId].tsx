import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useBooking } from '@/hooks/useBookings';

export default function LeaveReview() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: booking } = useBooking(bookingId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!rating || !profile || !booking) return;
    setLoading(true);
    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      reviewer_id: profile.id,
      musician_id: booking.musician_id,
      rating,
      comment: comment.trim() || null,
    });
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Thank you!', 'Your review has been submitted.');
    router.replace('/(client)/bookings');
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-2xl font-bold mb-2">Leave a Review</Text>
      <Text className="text-muted mb-8">How was your experience?</Text>

      <Text className="text-sm font-medium text-gray-700 mb-3">Rating *</Text>
      <View className="flex-row gap-3 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text className={`text-4xl ${rating >= star ? 'text-secondary' : 'text-gray-300'}`}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-1">Comment (optional)</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-8 text-base"
        placeholder="Share your experience..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity
        className={`rounded-2xl py-4 items-center ${rating ? 'bg-primary' : 'bg-gray-200'}`}
        onPress={handleSubmit}
        disabled={!rating || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className={`font-bold text-lg ${rating ? 'text-white' : 'text-gray-400'}`}>Submit Review</Text>}
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 items-center" onPress={() => router.replace('/(client)/bookings')}>
        <Text className="text-muted">Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}
