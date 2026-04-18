import { View, Text, TouchableOpacity, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useMusicianBookings } from '@/hooks/useBookings';
import { formatCurrency } from '@/lib/stripe';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
    ?.filter((b) => b.status === 'completed' && new Date((b as any).completed_at!).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + b.musician_payout, 0) ?? 0;

  return (
    <ScrollView className="flex-1 bg-bg-primary" contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 40 }}>
      <Text className="text-text-primary text-2xl font-bold mb-1">Dashboard</Text>
      <Text className="text-text-muted mb-6">Welcome back, {profile?.full_name?.split(' ')[0]}</Text>

      {/* Availability toggle */}
      <Card className="flex-row items-center justify-between mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-text-primary font-semibold">Available for Bookings</Text>
          <Text className="text-text-muted text-sm mt-0.5">
            {isAvailable ? 'Your profile is visible to clients' : 'Hidden from search'}
          </Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={toggleAvailability}
          disabled={loadingToggle}
          trackColor={{ false: '#27272A', true: '#6366F1' }}
          thumbColor="#FAFAFA"
        />
      </Card>

      {/* Stats row */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-bg-surface border border-border-default rounded-xl p-4">
          <Text className="text-text-muted text-xs mb-1">This Month</Text>
          <Text className="text-brand-primary text-lg font-bold">{formatCurrency(thisMonthEarnings)}</Text>
        </View>
        <View className="flex-1 bg-bg-surface border border-border-default rounded-xl p-4">
          <Text className="text-text-muted text-xs mb-1">Pending</Text>
          <Text className="text-status-warning text-lg font-bold">{pending.length}</Text>
        </View>
        <View className="flex-1 bg-bg-surface border border-border-default rounded-xl p-4">
          <Text className="text-text-muted text-xs mb-1">Confirmed</Text>
          <Text className="text-status-success text-lg font-bold">{confirmed.length}</Text>
        </View>
      </View>

      {isLoading && <ActivityIndicator color="#6366F1" className="mb-4" />}

      {/* Pending requests */}
      {pending.length > 0 && (
        <>
          <Text className="text-text-primary font-semibold mb-3">Pending Requests</Text>
          {pending.map((b) => (
            <TouchableOpacity
              key={b.id}
              className="bg-bg-surface border border-status-warning/30 rounded-2xl p-4 mb-2"
              onPress={() => router.push(`/(musician)/bookings/${b.id}`)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-text-primary">{(b as any).client?.full_name}</Text>
                <Badge label="pending" variant="pending" />
              </View>
              <Text className="text-text-muted text-sm">{b.event_type} · {new Date(b.event_date).toLocaleDateString()}</Text>
              <Text className="text-brand-primary font-semibold mt-2">{formatCurrency(b.musician_payout)}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Next confirmed gig */}
      {confirmed.length > 0 && (
        <>
          <Text className="text-text-primary font-semibold mb-3 mt-4">Next Gig</Text>
          <TouchableOpacity
            className="bg-bg-surface border border-status-success/30 rounded-2xl p-4"
            onPress={() => router.push(`/(musician)/bookings/${confirmed[0].id}`)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="font-semibold text-text-primary">{confirmed[0].event_type}</Text>
              <Badge label="confirmed" variant="confirmed" />
            </View>
            <Text className="text-text-muted text-sm">{new Date(confirmed[0].event_date).toLocaleString()}</Text>
            {confirmed[0].location ? <Text className="text-text-muted text-sm mt-0.5">{confirmed[0].location}</Text> : null}
          </TouchableOpacity>
        </>
      )}

      {!isLoading && pending.length === 0 && confirmed.length === 0 && (
        <View className="items-center mt-8">
          <Text className="text-4xl mb-4">🎸</Text>
          <Text className="text-text-muted text-base">No upcoming bookings</Text>
          <Text className="text-text-muted text-sm mt-1">Make sure you're available to get discovered</Text>
        </View>
      )}
    </ScrollView>
  );
}
