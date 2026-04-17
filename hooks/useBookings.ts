import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useClientBookings() {
  const profile = useAuthStore((s) => s.profile);
  return useQuery({
    queryKey: ['bookings', 'client', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, musician:musician_profiles(*, profile:profiles(*))')
        .eq('client_id', profile!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMusicianBookings() {
  const profile = useAuthStore((s) => s.profile);
  return useQuery({
    queryKey: ['bookings', 'musician', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, client:profiles(*)')
        .eq('musician_id', profile!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, client:profiles(*), musician:musician_profiles(*, profile:profiles(*))')
        .eq('id', bookingId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/complete-booking`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/cancel-booking`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session!.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
