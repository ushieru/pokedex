import { CachedPokemon } from '../../domain/model/CachedPokemon'
import { ILocalDataSource } from './ILocalDataSource'

export class MemoryLocalDataSource implements ILocalDataSource {
  pokemonMap: Map<string, CachedPokemon> = new Map();

  async getPokemon(key: string | number): Promise<CachedPokemon | null> {
    try {
      const storageKey = this.getStorageKey(key)
      const pokemon = this.pokemonMap.get(storageKey)
      return pokemon || null
    } catch (error) {
      console.error(`Error getting Pokemon ${key} from memory:`, error)
      return null
    }
  }

  async savePokemon(pokemon: CachedPokemon): Promise<void> {
    try {
      const storageKey = this.getStorageKey(pokemon.name)
      const pokemonWithTimestamp: CachedPokemon = {
        ...pokemon,
        cachedAt: Date.now(),
      }
      this.pokemonMap.set(storageKey, pokemonWithTimestamp)
      console.log(`[Memory Cache] Saved ${pokemon.name}`)
    } catch (error) {
      console.error(`Error saving Pokemon ${pokemon.name} to memory:`, error)
      throw new Error(`Failed to save Pokemon: ${error}`)
    }
  }

  async deletePokemon(key: string | number): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key)
      this.pokemonMap.delete(storageKey)
    } catch (error) {
      console.error(`Error deleting Pokemon ${key} from memory:`, error)
      throw new Error(`Failed to delete Pokemon: ${error}`)
    }
  }

  async getAllPokemon(): Promise<CachedPokemon[]> {
    try {
      return Array.from(this.pokemonMap.values())
    } catch (error) {
      console.error('Error getting all Pokemon from memory:', error)
      return []
    }
  }

  async clearAll(): Promise<void> {
    try {
      this.pokemonMap.clear()
    } catch (error) {
      console.error('Error clearing memory:', error)
      throw new Error(`Failed to clear cache: ${error}`)
    }
  }

  async exists(key: string | number): Promise<boolean> {
    const pokemon = await this.getPokemon(key)
    return pokemon !== null
  }

  getStorageKey(key: string | number): string {
    return String(key).toLowerCase()
  }
}

export const memoryLocalDataSourceSingleton = new MemoryLocalDataSource()
