import { ScrollView, View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMusicianProfile } from '@/hooks/useMusicians';
import { formatCurrency } from '@/lib/stripe';
import { MUSICIAN_TYPES } from '@/constants/musicianTypes';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function MusicianProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: musician, isLoading } = useMusicianProfile(id);

  if (isLoading) return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <ActivityIndicator color="#6366F1" />
    </View>
  );
  if (!musician) return (
    <View className="flex-1 bg-bg-primary items-center justify-center">
      <Text className="text-text-muted">Musician not found</Text>
    </View>
  );

  const typeLabel = MUSICIAN_TYPES.find((t) => t.value === musician.musician_type)?.label ?? musician.musician_type;

  return (
    <View className="flex-1 bg-bg-primary">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="bg-bg-surface h-52 items-center justify-center relative">
          {musician.profile?.avatar_url ? (
            <Image source={{ uri: musician.profile.avatar_url }} className="w-28 h-28 rounded-full border-4 border-brand-primary" />
          ) : (
            <View className="w-28 h-28 rounded-full bg-indigo-500/20 items-center justify-center">
              <Text className="text-5xl">🎵</Text>
            </View>
          )}
          <TouchableOpacity
            className="absolute top-12 left-4 bg-bg-primary/60 rounded-full px-3 py-1.5"
            onPress={() => router.back()}
          >
            <Text className="text-text-primary text-sm">← Back</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 py-5">
          {/* Name + type */}
          <Text className="text-text-primary text-2xl font-bold">{musician.profile?.full_name}</Text>
          <View className="flex-row items-center gap-2 mt-1 mb-1">
            <Text className="text-brand-primary font-medium">{typeLabel}</Text>
            {musician.profile?.location ? (
              <Text className="text-text-muted text-sm">· {musician.profile.location}</Text>
            ) : null}
          </View>

          {/* Rating + rate */}
          <View className="flex-row items-center mt-2 mb-5">
            <Text className="text-status-warning">★</Text>
            <Text className="ml-1 font-semibold text-text-primary">{musician.avg_rating?.toFixed(1) ?? '—'}</Text>
            <Text className="text-text-muted ml-1 text-sm">({musician.review_count ?? 0} reviews)</Text>
            <Text className="ml-auto text-xl font-bold text-brand-primary">
              {formatCurrency(musician.hourly_rate)}
              <Text className="text-sm font-normal text-text-muted">/hr</Text>
            </Text>
          </View>

          {/* Genres */}
          {musician.genres?.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-5">
              {musician.genres.map((g: string) => (
                <View key={g} className="bg-indigo-500/10 border border-brand-primary/30 px-3 py-1 rounded-full">
                  <Text className="text-brand-primary text-xs font-medium">{g}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bio */}
          {musician.bio ? (
            <View className="mb-5">
              <Text className="text-text-primary font-semibold mb-2">About</Text>
              <Text className="text-text-muted leading-6">{musician.bio}</Text>
            </View>
          ) : null}

          {/* Photos */}
          {musician.media?.filter((m: { media_type: string }) => m.media_type === 'photo').length > 0 && (
            <View className="mb-5">
              <Text className="text-text-primary font-semibold mb-3">Photos</Text>
              <FlatList
                horizontal
                data={musician.media.filter((m: { media_type: string }) => m.media_type === 'photo')}
                keyExtractor={(m) => m.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image source={{ uri: item.storage_path }} className="w-32 h-32 rounded-xl mr-2" />
                )}
              />
            </View>
          )}

          {/* Reviews */}
          {musician.reviews?.length > 0 && (
            <View className="mb-6">
              <Text className="text-text-primary font-semibold mb-3">Reviews</Text>
              {musician.reviews.slice(0, 3).map((r: { id: string; rating: number; comment: string; reviewer?: { full_name: string } }) => (
                <View key={r.id} className="bg-bg-surface border border-border-default rounded-xl p-4 mb-2">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-status-warning text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                    <Text className="ml-2 font-medium text-sm text-text-primary">{r.reviewer?.full_name}</Text>
                  </View>
                  {r.comment ? <Text className="text-text-muted text-sm leading-5">{r.comment}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View className="px-5 pb-8 pt-4 bg-bg-primary border-t border-border-default">
        <Button
          label="Request Booking"
          size="lg"
          onPress={() => router.push({ pathname: '/(client)/bookings/new', params: { musicianId: id } })}
        />
      </View>
    </View>
  );
}
