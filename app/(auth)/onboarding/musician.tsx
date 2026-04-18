import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { MUSICIAN_TYPES, type MusicianType } from '@/constants/musicianTypes';
import { GENRES } from '@/constants/genres';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    <KeyboardAvoidingView className="flex-1 bg-bg-primary" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <View className="w-12 h-12 rounded-xl bg-brand-primary items-center justify-center mb-8">
          <Text className="text-text-primary text-2xl">🎸</Text>
        </View>
        <Text className="text-text-primary text-4xl font-bold mb-1">Set up your profile</Text>
        <Text className="text-text-muted text-base mb-10">Tell clients about your music</Text>

        {/* Musician type */}
        <Text className="text-text-muted text-xs font-medium uppercase tracking-widest mb-3">I am a...</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {MUSICIAN_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              className={`px-4 py-2 rounded-full border-2 ${
                musicianType === t.value
                  ? 'border-brand-primary bg-indigo-500/10'
                  : 'border-border-default bg-bg-surface'
              }`}
              onPress={() => setMusicianType(t.value)}
            >
              <Text className={`font-medium text-sm ${musicianType === t.value ? 'text-brand-primary' : 'text-text-muted'}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bio */}
        <Input
          label="Bio"
          placeholder="Tell clients about yourself..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ height: 100 }}
        />

        {/* Genres */}
        <Text className="text-text-muted text-xs font-medium uppercase tracking-widest mb-3">Genres</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g}
              className={`px-3 py-1.5 rounded-full border ${
                selectedGenres.includes(g)
                  ? 'border-brand-primary bg-indigo-500/10'
                  : 'border-border-default bg-bg-surface'
              }`}
              onPress={() => toggleGenre(g)}
            >
              <Text className={`text-sm font-medium ${selectedGenres.includes(g) ? 'text-brand-primary' : 'text-text-muted'}`}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Hourly Rate (USD)"
          placeholder="150"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="decimal-pad"
        />

        <Input
          label="Location"
          placeholder="City, State"
          value={location}
          onChangeText={setLocation}
        />

        <Button label="Launch My Profile" onPress={handleSave} loading={loading} size="lg" />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
