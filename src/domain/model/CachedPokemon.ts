import { PokemonAbility } from './PokemonAbility';
import { PokemonStat } from './PokemonStat';

export interface CachedPokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number | null
  sprites: {
    front_default: string | null
    officialArtwork?: string | null
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  abilities: Array<{
    ability: {
      name: string
    }
    is_hidden: boolean
    slot: number
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  cachedAt: number
}
