import { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View className="px-4 pt-14 pb-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary">← Back</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages ?? []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const mine = item.sender_id === profile?.id;
          return (
            <View className={`max-w-[75%] ${mine ? 'self-end' : 'self-start'}`}>
              <View className={`px-4 py-2 rounded-2xl ${mine ? 'bg-primary' : 'bg-gray-100'}`}>
                <Text className={mine ? 'text-white' : 'text-gray-900'}>{item.body}</Text>
              </View>
              <Text className="text-xs text-muted mt-1 px-1">
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <View className="flex-row items-end px-4 py-3 border-t border-gray-100">
        <TextInput
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base mr-2"
          placeholder="Message..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          className="bg-primary w-11 h-11 rounded-full items-center justify-center"
          onPress={handleSend}
          disabled={sendMutation.isPending}
        >
          <Text className="text-white font-bold">↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
