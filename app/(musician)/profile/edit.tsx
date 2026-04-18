import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { GENRES } from '@/constants/genres';
import { MUSICIAN_TYPES, type MusicianType } from '@/constants/musicianTypes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    Alert.alert('Saved!', 'Your profile has been updated.', [{ text: 'OK', onPress: () => router.back() }]);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg-primary" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-brand-primary font-medium">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold mb-8">Edit Profile</Text>

        {/* Musician type */}
        <Text className="text-text-muted text-xs font-medium uppercase tracking-widest mb-3">Type</Text>
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

        <Input
          label="Bio"
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
                genres.includes(g)
                  ? 'border-brand-primary bg-indigo-500/10'
                  : 'border-border-default bg-bg-surface'
              }`}
              onPress={() => setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])}
            >
              <Text className={`text-sm font-medium ${genres.includes(g) ? 'text-brand-primary' : 'text-text-muted'}`}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Hourly Rate (USD)"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="decimal-pad"
        />

        <Button label="Save Changes" onPress={handleSave} loading={loading} size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
