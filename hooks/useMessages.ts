import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useConversations() {
  const profile = useAuthStore((s) => s.profile);
  return useQuery({
    queryKey: ['conversations', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const col = profile!.role === 'client' ? 'client_id' : 'musician_id';
      const { data, error } = await supabase
        .from('conversations')
        .select('*, client:profiles!client_id(*), musician:musician_profiles!musician_id(*, profile:profiles(*))')
        .eq(col, profile!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMessages(conversationId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        () => qc.invalidateQueries({ queryKey: ['messages', conversationId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, body }: { conversationId: string; body: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        body,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['messages', vars.conversationId] }),
  });
}
