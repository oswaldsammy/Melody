import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { GENRES } from '@/constants/genres';
import { MUSICIAN_TYPES, type MusicianType } from '@/constants/musicianTypes';

export default function EditMusicianProfile() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [bio, setBio] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [musicianType, setMusicianType] = useState<MusicianType>('solo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase.from('musician_profiles').select('*').eq('id', profile.id).single().then(({ data }) => {
      if (!data) return;
      setBio(data.bio ?? '');
      setGenres(data.genres ?? []);
      setHourlyRate((data.hourly_rate / 100).toString());
      setMusicianType(data.musician_type);
    });
  }, [profile]);

  async function handleSave() {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase.from('musician_profiles').update({
      bio,
      genres,
      hourly_rate: Math.round(parseFloat(hourlyRate) * 100),
      musician_type: musicianType,
    }).eq('id', profile.id);
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Saved!');
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-primary">← Back</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold mb-6">Edit Profile</Text>

      <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {MUSICIAN_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            className={`px-4 py-2 rounded-full border-2 ${musicianType === t.value ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onPress={() => setMusicianType(t.value)}
          >
            <Text className={musicianType === t.value ? 'text-primary font-semibold' : 'text-gray-600'}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-1">Bio</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text className="text-sm font-medium text-gray-700 mb-2">Genres</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g}
            className={`px-3 py-1.5 rounded-full border ${genres.includes(g) ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onPress={() => setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])}
          >
            <Text className={genres.includes(g) ? 'text-primary text-sm font-medium' : 'text-gray-600 text-sm'}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-8 text-base"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center"
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-base">Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
