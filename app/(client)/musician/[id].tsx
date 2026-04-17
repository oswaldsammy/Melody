import { ScrollView, View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMusicianProfile } from '@/hooks/useMusicians';
import { formatCurrency } from '@/lib/stripe';
import { MUSICIAN_TYPES } from '@/constants/musicianTypes';

export default function MusicianProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: musician, isLoading } = useMusicianProfile(id);

  if (isLoading) return <ActivityIndicator className="flex-1 mt-20" color="#7C3AED" />;
  if (!musician) return <Text className="flex-1 text-center mt-20 text-muted">Not found</Text>;

  const typeLabel = MUSICIAN_TYPES.find((t) => t.value === musician.musician_type)?.label ?? musician.musician_type;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero */}
      <View className="bg-primary/10 h-48 items-center justify-center">
        {musician.profile?.avatar_url ? (
          <Image source={{ uri: musician.profile.avatar_url }} className="w-28 h-28 rounded-full border-4 border-white" />
        ) : (
          <View className="w-28 h-28 rounded-full bg-primary/30 items-center justify-center">
            <Text className="text-5xl">🎵</Text>
          </View>
        )}
      </View>

      <View className="px-5 py-4">
        <Text className="text-2xl font-bold text-gray-900">{musician.profile?.full_name}</Text>
        <Text className="text-primary font-medium">{typeLabel}</Text>
        <Text className="text-muted">{musician.profile?.location}</Text>

        <View className="flex-row items-center mt-2 mb-4">
          <Text className="text-secondary text-lg">★</Text>
          <Text className="ml-1 font-semibold">{musician.avg_rating.toFixed(1)}</Text>
          <Text className="text-muted ml-1">({musician.review_count} reviews)</Text>
          <Text className="ml-auto text-xl font-bold text-primary">{formatCurrency(musician.hourly_rate)}<Text className="text-sm font-normal text-muted">/hr</Text></Text>
        </View>

        {/* Genres */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {musician.genres?.map((g: string) => (
            <View key={g} className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary text-sm font-medium">{g}</Text>
            </View>
          ))}
        </View>

        {/* Bio */}
        {musician.bio && (
          <>
            <Text className="font-semibold text-gray-900 mb-1">About</Text>
            <Text className="text-gray-600 mb-4">{musician.bio}</Text>
          </>
        )}

        {/* Photos */}
        {musician.media?.filter((m: { media_type: string }) => m.media_type === 'photo').length > 0 && (
          <>
            <Text className="font-semibold text-gray-900 mb-2">Photos</Text>
            <FlatList
              horizontal
              data={musician.media.filter((m: { media_type: string }) => m.media_type === 'photo')}
              keyExtractor={(m) => m.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image source={{ uri: item.storage_path }} className="w-32 h-32 rounded-xl mr-2" />
              )}
              className="mb-4"
            />
          </>
        )}

        {/* Reviews */}
        {musician.reviews?.slice(0, 3).map((r: { id: string; rating: number; comment: string; reviewer?: { full_name: string } }) => (
          <View key={r.id} className="border border-gray-100 rounded-xl p-3 mb-2">
            <View className="flex-row items-center mb-1">
              <Text className="text-secondary">{'★'.repeat(r.rating)}</Text>
              <Text className="ml-2 font-medium text-sm">{r.reviewer?.full_name}</Text>
            </View>
            {r.comment && <Text className="text-gray-600 text-sm">{r.comment}</Text>}
          </View>
        ))}
      </View>

      {/* CTA */}
      <View className="px-5 pb-8">
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center"
          onPress={() => router.push({ pathname: '/(client)/bookings/new', params: { musicianId: id } })}
        >
          <Text className="text-white font-bold text-lg">Request Booking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
