import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { uploadMusicianPhoto } from '@/lib/storage';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function MediaManager() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: media, isLoading } = useQuery({
    queryKey: ['musician-media', profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('musician_media')
        .select('*')
        .eq('musician_id', profile!.id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('musician_media').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['musician-media'] }),
  });

  async function pickAndUploadPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !profile) return;

    setUploading(true);
    try {
      const fileId = Date.now().toString();
      const url = await uploadMusicianPhoto(profile.id, result.assets[0].uri, fileId);
      await supabase.from('musician_media').insert({
        musician_id: profile.id,
        media_type: 'photo',
        storage_path: url,
        sort_order: (media?.length ?? 0),
      });
      qc.invalidateQueries({ queryKey: ['musician-media'] });
    } catch (err: any) {
      Alert.alert('Upload failed', err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View className="flex-1 bg-bg-primary">
      <View className="px-4 pt-14 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-brand-primary font-medium">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold">Photos & Audio</Text>
        <View className="w-12" />
      </View>

      <View className="px-4 mb-4">
        <Button label={uploading ? 'Uploading...' : '+ Add Photo'} onPress={pickAndUploadPhoto} loading={uploading} />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#6366F1" className="mt-8" />
      ) : (
        <FlatList
          data={media?.filter((m) => m.media_type === 'photo') ?? []}
          keyExtractor={(m) => m.id}
          numColumns={3}
          contentContainerStyle={{ padding: 8 }}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-4xl mb-4">🖼️</Text>
              <Text className="text-text-muted">No photos yet</Text>
              <Text className="text-text-muted text-sm mt-1">Add photos to attract more clients</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="flex-1 m-1 aspect-square relative">
              <Image source={{ uri: item.storage_path }} className="w-full h-full rounded-xl" />
              <TouchableOpacity
                className="absolute top-1 right-1 bg-status-error w-6 h-6 rounded-full items-center justify-center"
                onPress={() => Alert.alert('Delete Photo', 'Remove this photo?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                ])}
              >
                <Text className="text-text-primary text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
