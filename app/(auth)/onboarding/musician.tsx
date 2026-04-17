import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { MUSICIAN_TYPES, type MusicianType } from '@/constants/musicianTypes';
import { GENRES } from '@/constants/genres';

export default function MusicianOnboarding() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [musicianType, setMusicianType] = useState<MusicianType>('solo');
  const [bio, setBio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  async function handleSave() {
    if (!profile || !hourlyRate) return;
    setLoading(true);

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ location })
      .eq('id', profile.id);

    const { error: mpErr } = await supabase.from('musician_profiles').insert({
      id: profile.id,
      musician_type: musicianType,
      bio,
      genres: selectedGenres,
      hourly_rate: Math.round(parseFloat(hourlyRate) * 100),
    });

    setLoading(false);

    if (profileErr || mpErr) {
      Alert.alert('Error', profileErr?.message ?? mpErr?.message);
      return;
    }

    const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
    if (data) setProfile(data);

    router.replace('/(musician)/dashboard');
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <Text className="text-2xl font-bold mb-2">Set up your profile</Text>
      <Text className="text-muted mb-8">Tell clients about your music</Text>

      <Text className="text-sm font-medium text-gray-700 mb-2">I am a...</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
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
        placeholder="Tell clients about yourself..."
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text className="text-sm font-medium text-gray-700 mb-2">Genres</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g}
            className={`px-3 py-1.5 rounded-full border ${selectedGenres.includes(g) ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onPress={() => toggleGenre(g)}
          >
            <Text className={selectedGenres.includes(g) ? 'text-primary text-sm font-medium' : 'text-gray-600 text-sm'}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-base"
        placeholder="150"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="decimal-pad"
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">Location</Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-8 text-base"
        placeholder="City, State"
        value={location}
        onChangeText={setLocation}
      />

      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center mb-8"
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-base">Continue to Stripe Setup</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
