import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MusicianType } from '@/types/database';

interface SearchParams {
  musicianType?: MusicianType;
  genres?: string[];
  location?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  limit?: number;
  offset?: number;
}

export function useSearchMusicians(params: SearchParams) {
  return useQuery({
    queryKey: ['musicians', params],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_musicians', {
        p_musician_type: params.musicianType ?? null,
        p_genres: params.genres ?? null,
        p_location: params.location ?? null,
        p_min_rate: params.minRate ?? null,
        p_max_rate: params.maxRate ?? null,
        p_min_rating: params.minRating ?? null,
        p_limit: params.limit ?? 20,
        p_offset: params.offset ?? 0,
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useMusicianProfile(musicianId: string) {
  return useQuery({
    queryKey: ['musician', musicianId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('musician_profiles')
        .select('*, profile:profiles(*), media:musician_media(*), reviews(*)')
        .eq('id', musicianId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
