import { PokemonDetail } from "./PokemonDetail";
import { PokemonListResponse } from "./PokemonListResponse";

export interface PokemonRepository {
    getPokemonList(limit: number, offset: number): Promise<PokemonListResponse>
    getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail>
    getPokemonListWithDetails(limit: number, offset: number): Promise<PokemonDetail[]>
}