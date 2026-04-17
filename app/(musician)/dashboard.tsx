import { View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useMusicianBookings } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/stripe';

export default function MusicianDashboard() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: bookings, isLoading } = useMusicianBookings();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loadingToggle, setLoadingToggle] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('musician_profiles')
      .select('is_available')
      .eq('id', profile.id)
      .single()
      .then(({ data }) => { if (data) setIsAvailable(data.is_available); });
  }, [profile]);

  async function toggleAvailability(val: boolean) {
    setLoadingToggle(true);
    await supabase.from('musician_profiles').update({ is_available: val }).eq('id', profile!.id);
    setIsAvailable(val);
    setLoadingToggle(false);
  }

  const pending = bookings?.filter((b) => b.status === 'pending') ?? [];
  const confirmed = bookings?.filter((b) => b.status === 'confirmed') ?? [];
  const thisMonthEarnings = bookings
    ?.filter((b) => b.status === 'completed' && new Date(b.completed_at!).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + b.musician_payout, 0) ?? 0;

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <Text className="text-2xl font-bold text-gray-900 mb-1">Dashboard</Text>
      <Text className="text-muted mb-6">Welcome, {profile?.full_name}</Text>

      {/* Availability toggle */}
      <View className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-4 shadow-sm">
        <View>
          <Text className="font-semibold text-gray-900">Available for Bookings</Text>
          <Text className="text-muted text-sm">{isAvailable ? 'Your profile is visible' : 'Hidden from search'}</Text>
        </View>
        <Switch value={isAvailable} onValueChange={toggleAvailability} disabled={loadingToggle} thumbColor="#7C3AED" />
      </View>

      {/* Stats */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-muted text-sm">This Month</Text>
          <Text className="text-xl font-bold text-primary">{formatCurrency(thisMonthEarnings)}</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-muted text-sm">Pending</Text>
          <Text className="text-xl font-bold text-yellow-500">{pending.length}</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-muted text-sm">Confirmed</Text>
          <Text className="text-xl font-bold text-green-600">{confirmed.length}</Text>
        </View>
      </View>

      {/* Pending requests */}
      {pending.length > 0 && (
        <>
          <Text className="font-semibold text-gray-900 mb-2">Pending Requests</Text>
          {pending.map((b) => (
            <TouchableOpacity
              key={b.id}
              className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-2"
              onPress={() => router.push(`/(musician)/bookings/${b.id}`)}
            >
              <Text className="font-semibold">{(b as any).client?.full_name}</Text>
              <Text className="text-muted text-sm">{b.event_type} · {new Date(b.event_date).toLocaleDateString()}</Text>
              <Text className="text-primary font-medium mt-1">{formatCurrency(b.musician_payout)}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Next confirmed gig */}
      {confirmed.length > 0 && (
        <>
          <Text className="font-semibold text-gray-900 mb-2 mt-4">Next Gig</Text>
          <TouchableOpacity
            className="bg-green-50 border border-green-200 rounded-2xl p-4"
            onPress={() => router.push(`/(musician)/bookings/${confirmed[0].id}`)}
          >
            <Text className="font-semibold">{confirmed[0].event_type}</Text>
            <Text className="text-muted text-sm">{new Date(confirmed[0].event_date).toLocaleString()}</Text>
            <Text className="text-muted text-sm">{confirmed[0].location}</Text>
          </TouchableOpacity>
        </>
      )}

      {isLoading && <ActivityIndicator color="#7C3AED" className="mt-4" />}
    </ScrollView>
  );
}
