import { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMutation = useSendMessage();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  async function handleSend() {
    const body = text.trim();
    if (!body) return;
    setText('');
    await sendMutation.mutateAsync({ conversationId, body });
    listRef.current?.scrollToEnd({ animated: true });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="px-4 pt-14 pb-3 border-b border-border-default">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-brand-primary font-medium">← Back</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366F1" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages ?? []}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-text-muted text-sm">No messages yet. Say hello!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const mine = item.sender_id === profile?.id;
            return (
              <View className={`max-w-[75%] ${mine ? 'self-end' : 'self-start'}`}>
                <View className={`px-4 py-2.5 rounded-2xl ${mine ? 'bg-brand-primary' : 'bg-bg-surface border border-border-default'}`}>
                  <Text className={mine ? 'text-text-primary' : 'text-text-primary'}>{item.body}</Text>
                </View>
                <Text className="text-xs text-text-muted mt-1 px-1">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View className="flex-row items-end px-4 py-3 border-t border-border-default bg-bg-primary">
        <TextInput
          className="flex-1 bg-bg-surface border border-border-default rounded-2xl px-4 py-3 text-base text-text-primary mr-2"
          placeholder="Message..."
          placeholderTextColor="#A1A1AA"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          className={`w-11 h-11 rounded-full items-center justify-center ${text.trim() ? 'bg-brand-primary' : 'bg-bg-surface border border-border-default'}`}
          onPress={handleSend}
          disabled={sendMutation.isPending || !text.trim()}
        >
          <Text className={`font-bold text-lg ${text.trim() ? 'text-text-primary' : 'text-text-muted'}`}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
