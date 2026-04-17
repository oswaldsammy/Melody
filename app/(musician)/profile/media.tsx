import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { uploadMusicianPhoto } from '@/lib/storage';
import { useAuthStore } from '@/store/authStore';

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
    <View className="flex-1 bg-white">
      <View className="px-4 pt-14 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-primary">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold">Photos & Audio</Text>
      </View>

      <View className="px-4 mb-4">
        <TouchableOpacity
          className="bg-primary rounded-xl py-3 items-center"
          onPress={pickAndUploadPhoto}
          disabled={uploading}
        >
          {uploading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">+ Add Photo</Text>}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#7C3AED" className="mt-8" />
      ) : (
        <FlatList
          data={media?.filter((m) => m.media_type === 'photo') ?? []}
          keyExtractor={(m) => m.id}
          numColumns={3}
          contentContainerStyle={{ padding: 8 }}
          ListEmptyComponent={<Text className="text-center text-muted mt-8">No photos yet</Text>}
          renderItem={({ item }) => (
            <View className="flex-1 m-1 aspect-square relative">
              <Image source={{ uri: item.storage_path }} className="w-full h-full rounded-xl" />
              <TouchableOpacity
                className="absolute top-1 right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                onPress={() => Alert.alert('Delete', 'Remove this photo?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) },
                ])}
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
