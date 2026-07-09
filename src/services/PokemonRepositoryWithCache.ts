import { PokemonRepository } from '../domain/model/PokemonRepository';
import { PokemonDetail } from '../domain/model/PokemonDetail';
import { PokemonListResponse } from '../domain/model/PokemonListResponse';
import { ILocalDataSource } from '../data/local/ILocalDataSource';
import { ICacheStrategy } from '../data/cache/ICacheStrategy';
import { CachedPokemon } from '../domain/model/CachedPokemon';

export class PokemonRepositoryWithCache implements PokemonRepository {
  baseRepository: PokemonRepository;
  localDataSource: ILocalDataSource;
  cacheStrategy: ICacheStrategy;

  constructor(
    baseRepository: PokemonRepository,
    localDataSource: ILocalDataSource,
    cacheStrategy: ICacheStrategy
  ) {
    this.baseRepository = baseRepository;
    this.localDataSource = localDataSource;
    this.cacheStrategy = cacheStrategy;
  }

  async getPokemonList(limit: number, offset: number): Promise<PokemonListResponse> {
    return this.baseRepository.getPokemonList(limit, offset);
  }

  async getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
    const cached = await this.localDataSource.getPokemon(nameOrId);

    if (cached && this.cacheStrategy.isValid(cached.cachedAt)) {
      console.log(`[Cache HIT] Pokémon ${nameOrId}`);
      return this.deserializePokemon(cached);
    }

    console.log(`[Cache MISS] Pokémon ${nameOrId} - fetching from API`);
    const pokemon = await this.baseRepository.getPokemonDetail(nameOrId);

    try {
      const cachedVersion = this.serializePokemon(pokemon);
      await this.localDataSource.savePokemon(cachedVersion);
    } catch (error) {
      console.warn('Failed to cache Pokemon detail:', error);
    }

    return pokemon;
  }

  async getPokemonListWithDetails(limit: number = 20, offset: number = 0): Promise<PokemonDetail[]> {
    const listResponse = await this.baseRepository.getPokemonList(limit, offset);

    const pokemonDetails = await Promise.all(
      listResponse.results.map(pokemon => this.getPokemonDetail(pokemon.name))
    );

    return pokemonDetails;
  }

  serializePokemon(pokemon: PokemonDetail): CachedPokemon {
    return {
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height,
      weight: pokemon.weight,
      base_experience: pokemon.base_experience,
      sprites: {
        front_default: pokemon.sprites.front_default,
        officialArtwork: pokemon.sprites.other?.['official-artwork']?.front_default,
      },
      types: pokemon.types,
      abilities: pokemon.abilities.map(a => ({
        ability: { name: a.ability.name },
        is_hidden: a.is_hidden,
        slot: a.slot,
      })),
      stats: pokemon.stats.map(s => ({
        base_stat: s.base_stat,
        stat: { name: s.stat.name },
      })),
      cachedAt: Date.now(),
    };
  }

  deserializePokemon(cached: CachedPokemon): PokemonDetail {
    return {
      id: cached.id,
      name: cached.name,
      height: cached.height,
      weight: cached.weight,
      base_experience: cached.base_experience,
      sprites: {
        front_default: cached.sprites.front_default,
        other: cached.sprites.officialArtwork ? {
          'official-artwork': {
            front_default: cached.sprites.officialArtwork,
          },
        } : undefined,
      },
      types: cached.types,
      abilities: cached.abilities.map(a => ({
        ability: { name: a.ability.name, url: '' },
        is_hidden: a.is_hidden,
        slot: a.slot,
      })),
      stats: cached.stats.map(s => ({
        base_stat: s.base_stat,
        effort: 0,
        stat: { name: s.stat.name, url: '' },
      })),
    };
  }

  async clearCache(): Promise<void> {
    await this.localDataSource.clearAll();
  }

  async getCachedPokemon(): Promise<PokemonDetail[]> {
    const cached = await this.localDataSource.getAllPokemon();
    return cached.map(c => this.deserializePokemon(c));
  }

  async getCacheStats(): Promise<{ count: number; strategyTTL: number }> {
    const cached = await this.localDataSource.getAllPokemon();
    return {
      count: cached.length,
      strategyTTL: this.cacheStrategy.getTTL(),
    };
  }
}
