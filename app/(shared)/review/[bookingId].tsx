import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useBooking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    Alert.alert('Thank you!', 'Your review has been submitted.', [
      { text: 'OK', onPress: () => router.replace('/(client)/bookings') },
    ]);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-primary" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-8">

          <View className="w-12 h-12 rounded-xl bg-status-warning/20 items-center justify-center mb-8">
            <Text className="text-2xl">⭐</Text>
          </View>
          <Text className="text-text-primary text-3xl font-bold mb-1">Leave a Review</Text>
          <Text className="text-text-muted text-base mb-10">How was your experience?</Text>

          {/* Star rating */}
          <Text className="text-text-muted text-xs font-medium uppercase tracking-widest mb-4">Your Rating *</Text>
          <View className="flex-row gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Text className={`text-4xl ${rating >= star ? 'text-status-warning' : 'text-border-default'}`}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Comment (optional)"
            placeholder="Share your experience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ height: 100 }}
          />

          <View className="mt-4 gap-3">
            <Button
              label="Submit Review"
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              variant={rating ? 'primary' : 'secondary'}
            />
            <Button
              label="Skip for now"
              variant="ghost"
              onPress={() => router.replace('/(client)/bookings')}
            />
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
