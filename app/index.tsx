import { PokemonCard } from '@/src/component/PokemonCard';
import { usePokemonInfiniteList } from '@/src/hooks/usePokemonInfiniteList';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function () {
    const { data: pokemonList, isLoading, isLoadingMore, error, hasMore, loadMore } = usePokemonInfiniteList();

    if (isLoading)
        return <View className="flex-1 items-center justify-center bg-gray-50">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-gray-600">Loading Pokémon...</Text>
        </View>

    if (error && pokemonList.length === 0)
        return <View className="flex-1 items-center justify-center bg-gray-50">
            <Text className="text-center text-red-600">Error: {error}</Text>
        </View>

    return <FlatList
        data={pokemonList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PokemonCard pokemon={item} />}
        onEndReached={() => {
            if (!isLoadingMore && hasMore) {
                loadMore();
            }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={() => {
            if (!isLoadingMore) return null;
            return <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="mt-2 text-sm text-gray-600">Loading more...</Text>
            </View>
        }}
        ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-gray-600">No Pokémon found</Text>
            </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        scrollEnabled={true}
    />
}

