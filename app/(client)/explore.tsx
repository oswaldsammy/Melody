import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, TextInput } from 'react-native';
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
    <View className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="bg-bg-primary px-4 pt-14 pb-4">
        <Text className="text-text-primary text-2xl font-bold mb-4">Find Musicians</Text>

        {/* Search */}
        <View className="flex-row items-center bg-bg-surface border border-border-default rounded-xl px-4 mb-3">
          <Text className="text-text-muted mr-2">🔍</Text>
          <TextInput
            className="flex-1 py-3 text-base text-text-primary"
            placeholder="Search by location..."
            placeholderTextColor="#A1A1AA"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Type filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ value: undefined, label: 'All' }, ...MUSICIAN_TYPES]}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full border ${
                selectedType === item.value
                  ? 'bg-brand-primary border-brand-primary'
                  : 'border-border-default bg-bg-surface'
              }`}
              onPress={() => setSelectedType(item.value as MusicianType | undefined)}
            >
              <Text className={`text-sm font-medium ${selectedType === item.value ? 'text-text-primary' : 'text-text-muted'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#6366F1" />
      ) : (
        <FlatList
          data={musicians ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-4xl mb-4">🎵</Text>
              <Text className="text-text-muted text-base">No musicians found</Text>
              <Text className="text-text-muted text-sm mt-1">Try adjusting your search</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-bg-surface border border-border-default rounded-2xl p-4 flex-row items-center"
              onPress={() => router.push(`/(client)/musician/${item.id}`)}
              activeOpacity={0.7}
            >
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} className="w-16 h-16 rounded-full" />
              ) : (
                <View className="w-16 h-16 rounded-full bg-indigo-500/20 items-center justify-center">
                  <Text className="text-2xl">🎵</Text>
                </View>
              )}
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text-primary text-base">{item.full_name}</Text>
                <Text className="text-text-muted text-sm capitalize mt-0.5">{item.musician_type?.replace('_', ' ')}</Text>
                {item.location ? <Text className="text-text-muted text-xs mt-0.5">{item.location}</Text> : null}
                <View className="flex-row items-center mt-2">
                  <Text className="text-status-warning text-sm">★</Text>
                  <Text className="text-sm text-text-primary ml-1 font-medium">{item.avg_rating?.toFixed(1) ?? '—'}</Text>
                  <Text className="text-text-muted text-xs ml-1">({item.review_count ?? 0})</Text>
                  <Text className="text-brand-primary text-sm font-semibold ml-auto">{formatCurrency(item.hourly_rate)}<Text className="text-text-muted font-normal">/hr</Text></Text>
                </View>
              </View>
              <Text className="text-text-muted ml-2">›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
