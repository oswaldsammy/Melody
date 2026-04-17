import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSearchMusicians } from '@/hooks/useMusicians';
import { MUSICIAN_TYPES } from '@/constants/musicianTypes';
import { formatCurrency } from '@/lib/stripe';
import type { MusicianType } from '@/types/database';

export default function Explore() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<MusicianType | undefined>();

  const { data: musicians, isLoading } = useSearchMusicians({
    musicianType: selectedType,
    location: search || undefined,
  });

  return (
    <View className="flex-1 bg-surface">
      <View className="bg-white px-4 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-3">Find Musicians</Text>
        <TextInput
          className="bg-gray-100 rounded-xl px-4 py-3 text-base mb-3"
          placeholder="Search by location..."
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ value: undefined, label: 'All' }, ...MUSICIAN_TYPES]}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full border ${selectedType === item.value ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              onPress={() => setSelectedType(item.value as MusicianType | undefined)}
            >
              <Text className={selectedType === item.value ? 'text-white font-medium' : 'text-gray-600'}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#7C3AED" />
      ) : (
        <FlatList
          data={musicians ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={<Text className="text-center text-muted mt-8">No musicians found</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm"
              onPress={() => router.push(`/(client)/musician/${item.id}`)}
            >
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} className="w-16 h-16 rounded-full" />
              ) : (
                <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
                  <Text className="text-2xl">🎵</Text>
                </View>
              )}
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-900">{item.full_name}</Text>
                <Text className="text-muted text-sm capitalize">{item.musician_type.replace('_', ' ')}</Text>
                <Text className="text-muted text-sm">{item.location}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-secondary">★</Text>
                  <Text className="text-sm text-gray-700 ml-1">{item.avg_rating.toFixed(1)} ({item.review_count})</Text>
                  <Text className="text-muted text-sm ml-auto">{formatCurrency(item.hourly_rate)}/hr</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
