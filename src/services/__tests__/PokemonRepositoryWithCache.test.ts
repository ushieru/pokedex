import { PokemonRepositoryWithCache } from '../PokemonRepositoryWithCache';
import { MemoryLocalDataSource } from '../../data/local/MemoryLocalDataSource';
import { InfiniteCacheStrategy } from '../../data/cache/InfiniteCacheStrategy';
import { MinutesCacheStrategy } from '../../data/cache/MinutesCacheStrategy';
import { PokemonRepository } from '../../domain/model/PokemonRepository';
import { PokemonDetail } from '../../domain/model/PokemonDetail';
import { PokemonListResponse } from '../../domain/model/PokemonListResponse';

const mockPokemonDetail: PokemonDetail = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  base_experience: 112,
  sprites: {
    front_default: 'https://example.com/bulbasaur.png',
    other: {
      'official-artwork': { front_default: 'https://example.com/bulbasaur-art.png' },
    },
  },
  types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
  abilities: [
    { ability: { name: 'overgrow', url: '' }, is_hidden: false, slot: 1 },
    { ability: { name: 'chlorophyll', url: '' }, is_hidden: true, slot: 3 },
  ],
  stats: [
    { base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } },
    { base_stat: 49, effort: 0, stat: { name: 'attack', url: '' } },
  ],
};

const mockListResponse: PokemonListResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
};

function makeMockBaseRepository(detail = mockPokemonDetail): jest.Mocked<PokemonRepository> {
  return {
    getPokemonList: jest.fn().mockResolvedValue(mockListResponse),
    getPokemonDetail: jest.fn().mockResolvedValue(detail),
    getPokemonListWithDetails: jest.fn().mockResolvedValue([detail]),
  };
}

describe('PokemonRepositoryWithCache', () => {
  let baseRepository: jest.Mocked<PokemonRepository>;
  let localDataSource: MemoryLocalDataSource;
  let repository: PokemonRepositoryWithCache;

  beforeEach(() => {
    baseRepository = makeMockBaseRepository();
    localDataSource = new MemoryLocalDataSource();
    repository = new PokemonRepositoryWithCache(
      baseRepository,
      localDataSource,
      new InfiniteCacheStrategy()
    );
  });

  describe('getPokemonDetail', () => {
    it('should fetch from API on cache miss and save to cache', async () => {
      const result = await repository.getPokemonDetail('bulbasaur');

      expect(baseRepository.getPokemonDetail).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('bulbasaur');

      const cached = await localDataSource.getPokemon('bulbasaur');
      expect(cached).not.toBeNull();
    });

    it('should return from cache on cache hit without calling API', async () => {
      // First call — fills cache
      await repository.getPokemonDetail('bulbasaur');
      // Second call — should hit cache
      const result = await repository.getPokemonDetail('bulbasaur');

      expect(baseRepository.getPokemonDetail).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('bulbasaur');
    });

    it('should call API again when cache is expired', async () => {
      const expiredStrategy = new MinutesCacheStrategy();
      const repoWithExpiredCache = new PokemonRepositoryWithCache(
        baseRepository,
        localDataSource,
        expiredStrategy
      );

      // Bypass savePokemon (which refreshes cachedAt) and insert directly
      const expiredEntry = {
        ...repository.serializePokemon(mockPokemonDetail),
        cachedAt: Date.now() - 31 * 60 * 1000, // 31 minutes ago
      };
      localDataSource.pokemonMap.set('bulbasaur', expiredEntry);

      await repoWithExpiredCache.getPokemonDetail('bulbasaur');
      expect(baseRepository.getPokemonDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPokemonList', () => {
    it('should delegate to base repository without caching', async () => {
      const result = await repository.getPokemonList(20, 0);

      expect(baseRepository.getPokemonList).toHaveBeenCalledWith(20, 0);
      expect(result.results).toHaveLength(1);
    });
  });

  describe('getPokemonListWithDetails', () => {
    it('should fetch detail for each pokemon in the list', async () => {
      const results = await repository.getPokemonListWithDetails(1, 0);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('bulbasaur');
    });
  });

  describe('clearCache', () => {
    it('should remove all cached pokemon', async () => {
      await repository.getPokemonDetail('bulbasaur');
      await repository.clearCache();

      const stats = await repository.getCacheStats();
      expect(stats.count).toBe(0);
    });
  });

  describe('getCachedPokemon', () => {
    it('should return all deserialized cached pokemon', async () => {
      await repository.getPokemonDetail('bulbasaur');
      const cached = await repository.getCachedPokemon();

      expect(cached).toHaveLength(1);
      expect(cached[0].name).toBe('bulbasaur');
    });
  });

  describe('getCacheStats', () => {
    it('should return correct count and TTL', async () => {
      await repository.getPokemonDetail('bulbasaur');
      const stats = await repository.getCacheStats();

      expect(stats.count).toBe(1);
      expect(stats.strategyTTL).toBe(Infinity);
    });
  });

  describe('serializePokemon / deserializePokemon', () => {
    it('should round-trip a PokemonDetail through serialize/deserialize', () => {
      const cached = repository.serializePokemon(mockPokemonDetail);
      const restored = repository.deserializePokemon(cached);

      expect(restored.id).toBe(mockPokemonDetail.id);
      expect(restored.name).toBe(mockPokemonDetail.name);
      expect(restored.types).toEqual(mockPokemonDetail.types);
      expect((restored.sprites as Record<string, unknown>)['official-artwork']).toBeUndefined();
      expect(restored.sprites.other?.['official-artwork']?.front_default)
        .toBe('https://example.com/bulbasaur-art.png');
    });
  });
});
