import { Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { PokemonDetail } from "../domain/model/PokemonDetail";

interface PokemonCardProperties {
    pokemon: PokemonDetail
}

export function PokemonCard({ pokemon }: PokemonCardProperties) {
    const router = useRouter();

    const imageUrl =
        pokemon.sprites.other?.['official-artwork']?.front_default ||
        pokemon.sprites.front_default;

    const types = pokemon.types.map((t) => t.type.name).join(', ');

    const handlePress = () => router.push({
        pathname: '/detail',
        params: { name: pokemon.name }
    });

    return <TouchableOpacity onPress={handlePress}>
        <View className="mb-4 rounded-lg bg-white p-4 shadow-md">
            <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-lg text-gray-500">#{pokemon.id}</Text>
                    <Text className="text-lg font-bold capitalize text-gray-800">
                        {pokemon.name}
                    </Text>
                </View>
                {imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: 90, height: 90 }}
                        resizeMode="contain"
                    />
                )}
            </View>
            <View className="gap-2">
                <View>
                    <Text className="text-xs font-semibold text-gray-600">Type</Text>
                    <Text className="capitalize text-gray-700">{types}</Text>
                </View>
                <View className="flex-row gap-4">
                    <View>
                        <Text className="text-xs font-semibold text-gray-600">Height</Text>
                        <Text className="text-gray-700">{pokemon.height / 10}m</Text>
                    </View>
                    <View>
                        <Text className="text-xs font-semibold text-gray-600">Weight</Text>
                        <Text className="text-gray-700">{pokemon.weight / 10}kg</Text>
                    </View>
                </View>
            </View>
        </View>
    </TouchableOpacity>
}
