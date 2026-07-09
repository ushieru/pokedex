import { Config } from "../domain/constant/Config"
import { PokemonDetail } from "../domain/model/PokemonDetail"
import { PokemonListResponse } from "../domain/model/PokemonListResponse"
import { PokemonRepository } from "../domain/model/PokemonRepository"

const { POKEAPI_BASE_URL } = Config

export class PokemonPokeApiRepository implements PokemonRepository {
  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    try {
      const response = await fetch(
        `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch Pokémon list: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to fetch Pokémon list: ${errorMessage}`)
    }
  }

  async getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId}`)

      if (!response.ok)
        throw new Error(`Failed to fetch Pokémon detail: ${response.statusText}`)

      return await response.json()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to fetch Pokémon detail: ${errorMessage}`)
    }
  }

  async getPokemonListWithDetails(limit: number = 20, offset: number = 0): Promise<PokemonDetail[]> {
    try {
      const listResponse = await this.getPokemonList(limit, offset)

      const pokemonDetails = await Promise.all(
        listResponse.results.map(pokemon => this.getPokemonDetail(pokemon.name)))

      return pokemonDetails
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to fetch Pokémon list with details: ${errorMessage}`)
    }
  }
}

export const pokemonPokeApiRepositorySingleton = new PokemonPokeApiRepository()