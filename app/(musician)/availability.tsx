import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function AvailabilityScreen() {
  const profile = useAuthStore((s) => s.profile);
  const qc = useQueryClient();

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
        { text: isBlocked ? 'Unblock' : 'Block', onPress: () => isBlocked ? removeBlock.mutate(date) : addBlock.mutate(date) },
      ]
    );
  }

  return (
    <View className="flex-1 bg-bg-primary">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold">Availability</Text>
        <Text className="text-text-muted text-sm mt-1">Tap a date to block or unblock it</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#6366F1" className="mt-8" />
      ) : (
        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            calendarBackground: '#09090B',
            dayTextColor: '#FAFAFA',
            textDisabledColor: '#3F3F46',
            monthTextColor: '#FAFAFA',
            arrowColor: '#6366F1',
            selectedDayBackgroundColor: '#6366F1',
            todayTextColor: '#6366F1',
            dotColor: '#6366F1',
          }}
        />
      )}

      <View className="flex-row gap-4 px-6 mt-6">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-status-error" />
          <Text className="text-text-muted text-sm">Blocked</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full border border-border-default" />
          <Text className="text-text-muted text-sm">Available</Text>
        </View>
      </View>
    </View>
  );
}
