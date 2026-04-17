import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function AvailabilityScreen() {
  const profile = useAuthStore((s) => s.profile);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['availability', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('musician_id', profile!.id)
        .eq('is_blocked', true);
      if (error) throw error;
      return data;
    },
  });

  const addBlock = useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase.from('availability').insert({
        musician_id: profile!.id,
        starts_at: `${date}T00:00:00`,
        ends_at: `${date}T23:59:59`,
        is_blocked: true,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  });

  const removeBlock = useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('musician_id', profile!.id)
        .gte('starts_at', `${date}T00:00:00`)
        .lte('ends_at', `${date}T23:59:59`);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  });

  const markedDates = (blocks ?? []).reduce((acc: Record<string, object>, b) => {
    const date = b.starts_at.split('T')[0];
    acc[date] = { selected: true, selectedColor: '#EF4444' };
    return acc;
  }, {});

  function handleDayPress(day: { dateString: string }) {
    const date = day.dateString;
    const isBlocked = !!markedDates[date];
    Alert.alert(
      isBlocked ? 'Unblock Date' : 'Block Date',
      isBlocked ? 'Make this date available again?' : 'Mark this date as unavailable?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isBlocked ? 'Unblock' : 'Block',
          onPress: () => isBlocked ? removeBlock.mutate(date) : addBlock.mutate(date),
        },
      ]
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900">Availability</Text>
        <Text className="text-muted">Tap a date to block/unblock it</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C3AED" className="mt-8" />
      ) : (
        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{ selectedDayBackgroundColor: '#7C3AED', todayTextColor: '#7C3AED' }}
        />
      )}

      <View className="flex-row gap-4 px-6 mt-4">
        <View className="flex-row items-center gap-2">
          <View className="w-4 h-4 rounded-full bg-red-400" />
          <Text className="text-muted text-sm">Blocked</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-4 h-4 rounded-full bg-gray-200" />
          <Text className="text-muted text-sm">Available</Text>
        </View>
      </View>
    </View>
  );
}
