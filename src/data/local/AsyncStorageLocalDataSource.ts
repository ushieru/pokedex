import AsyncStorage from '@react-native-async-storage/async-storage'
import { CachedPokemon } from '../../domain/model/CachedPokemon'
import { ILocalDataSource } from './ILocalDataSource'

const STORAGE_PREFIX = 'pokemon_'
const ALL_KEYS_PREFIX = 'pokemon_all_keys'

export class AsyncStorageLocalDataSource implements ILocalDataSource {
  async getPokemon(key: string | number): Promise<CachedPokemon | null> {
    try {
      const storageKey = this.getStorageKey(key)
      const data = await AsyncStorage.getItem(storageKey)

      if (!data) return null

      return JSON.parse(data) as CachedPokemon
    } catch (error) {
      console.error(`Error getting Pokemon ${key} from AsyncStorage:`, error)
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

      await AsyncStorage.setItem(storageKey, JSON.stringify(pokemonWithTimestamp))

      await this.addKeyToIndex(pokemon.name)
    } catch (error) {
      console.error(`Error saving Pokemon ${pokemon.name} to AsyncStorage:`, error)
      throw new Error(`Failed to save Pokemon: ${error}`)
    }
  }

  async deletePokemon(key: string | number): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key)
      await AsyncStorage.removeItem(storageKey)
      await this.removeKeyFromIndex(String(key))
    } catch (error) {
      console.error(`Error deleting Pokemon ${key} from AsyncStorage:`, error)
      throw new Error(`Failed to delete Pokemon: ${error}`)
    }
  }

  async getAllPokemon(): Promise<CachedPokemon[]> {
    try {
      const keys = await this.getIndexedKeys()
      if (keys.length === 0) return []
      const storageKeys = keys.map(key => this.getStorageKey(key))
      const items = await AsyncStorage.multiGet(storageKeys)
      return items
        .filter(([, value]) => value != null)
        .map(([, value]) => JSON.parse(value!) as CachedPokemon);
    } catch (error) {
      console.error('Error getting all Pokemon from AsyncStorage:', error)
      return []
    }
  }

  async clearAll(): Promise<void> {
    try {
      const keys = await this.getIndexedKeys()
      const storageKeys = keys.map(key => this.getStorageKey(key))

      await AsyncStorage.multiRemove(storageKeys)
      await AsyncStorage.removeItem(ALL_KEYS_PREFIX)
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error)
      throw new Error(`Failed to clear cache: ${error}`)
    }
  }

  async exists(key: string | number): Promise<boolean> {
    const pokemon = await this.getPokemon(key)
    return pokemon !== null
  }


  getStorageKey(key: string | number): string {
    return `${STORAGE_PREFIX}${String(key).toLowerCase()}`
  }

  async addKeyToIndex(key: string | number): Promise<void> {
    try {
      const keys = await this.getIndexedKeys()
      const keyStr = String(key).toLowerCase()

      if (!keys.includes(keyStr)) {
        keys.push(keyStr)
        await AsyncStorage.setItem(ALL_KEYS_PREFIX, JSON.stringify(keys))
      }
    } catch (error) {
      console.error('Error adding key to index:', error)
    }
  }

  async removeKeyFromIndex(key: string | number): Promise<void> {
    try {
      const keys = await this.getIndexedKeys()
      const keyStr = String(key).toLowerCase()
      const filtered = keys.filter(k => k !== keyStr)
      await AsyncStorage.setItem(ALL_KEYS_PREFIX, JSON.stringify(filtered))
    } catch (error) {
      console.error('Error removing key from index:', error)
    }
  }

  async getIndexedKeys(): Promise<string[]> {
    try {
      const keysJson = await AsyncStorage.getItem(ALL_KEYS_PREFIX)
      return keysJson ? JSON.parse(keysJson) : []
    } catch (error) {
      console.error('Error getting indexed keys:', error)
      return []
    }
  }
}

export const asyncStorageDataSourceSingleton = new AsyncStorageLocalDataSource()
