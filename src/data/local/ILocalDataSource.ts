import { CachedPokemon } from "@/src/domain/model/CachedPokemon";

export interface ILocalDataSource {
  getPokemon(key: string | number): Promise<CachedPokemon | null>;
  savePokemon(pokemon: CachedPokemon): Promise<void>;
  deletePokemon(key: string | number): Promise<void>;
  getAllPokemon(): Promise<CachedPokemon[]>;
  clearAll(): Promise<void>;
  exists(key: string | number): Promise<boolean>;
}
