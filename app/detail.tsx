import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePokemonDetail } from '@/src/hooks/usePokemonDetail';

export default function () {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { data: pokemon, isLoading, error } = usePokemonDetail(name || '');

  if (!name)
    return <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-red-600">No Pokémon selected</Text>
    </View>

  if (isLoading)
    return <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-600">Loading details...</Text>
    </View>

  if (error || !pokemon)
    return <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-center text-red-600">Error: {error}</Text>
    </View>

  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default;

  const abilities = pokemon.abilities
    .map((a) => (a.is_hidden ? `${a.ability.name} (hidden)` : a.ability.name))
    .join(', ');

  return <ScrollView>
    <View className="items-center bg-white px-4 py-6">
      <Text className="text-3xl font-bold capitalize text-gray-800">
        {pokemon.name}
      </Text>
      <Text className="mt-1 text-xl text-gray-600">#{pokemon.id}</Text>

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      )}
    </View>

    <View className="mx-4 mt-4 rounded-lg bg-white p-4">
      <Text className="mb-2 text-lg font-semibold text-gray-800">Types</Text>
      <View className="flex-row flex-wrap gap-2">
        {pokemon.types.map((t, i) => (
          <View key={i} className="rounded-full bg-blue-100 px-4 py-2">
            <Text className="capitalize text-blue-800">{t.type.name}</Text>
          </View>
        ))}
      </View>
    </View>

    <View className="mx-4 mt-4 rounded-lg bg-white p-4">
      <Text className="mb-3 text-lg font-semibold text-gray-800">
        Physical Attributes
      </Text>
      <View className="gap-3">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Height</Text>
          <Text className="font-semibold text-gray-800">
            {pokemon.height / 10}m
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Weight</Text>
          <Text className="font-semibold text-gray-800">
            {pokemon.weight / 10}kg
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Base Experience</Text>
          <Text className="font-semibold text-gray-800">
            {pokemon.base_experience || 'N/A'}
          </Text>
        </View>
      </View>
    </View>

    <View className="mx-4 mt-4 rounded-lg bg-white p-4">
      <Text className="mb-2 text-lg font-semibold text-gray-800">
        Abilities
      </Text>
      <Text className="capitalize text-gray-700">{abilities}</Text>
    </View>

    <View className="mx-4 mt-4 rounded-lg bg-white p-4 pb-6">
      <Text className="mb-3 text-lg font-semibold text-gray-800">
        Base Stats
      </Text>
      <View className="gap-3">
        {pokemon.stats.map((stat, i) => <View key={i}>
          <View className="flex-row justify-between mb-1">
            <Text className="capitalize text-gray-600">{stat.stat.name}</Text>
            <Text className="font-semibold text-gray-800">
              {stat.base_stat}
            </Text>
          </View>
          <View className="h-2 rounded-full bg-gray-200">
            <View
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${(stat.base_stat / 255) * 100}%` }}
            />
          </View>
        </View>
        )}
      </View>
    </View>
  </ScrollView>
}
