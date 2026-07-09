import { PokemonAbility } from './PokemonAbility';
import { PokemonStat } from './PokemonStat';

export interface PokemonDetail {
    id: number;
    name: string;
    height: number;
    weight: number;
    base_experience: number | null;
    sprites: {
        front_default: string | null;
        other?: {
            'official-artwork'?: {
                front_default: string | null;
            };
        };
    };
    types: Array<{
        type: {
            name: string;
        };
    }>;
    abilities: PokemonAbility[];
    stats: PokemonStat[];
}