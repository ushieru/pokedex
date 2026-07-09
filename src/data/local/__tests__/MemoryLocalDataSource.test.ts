import { MemoryLocalDataSource } from '../MemoryLocalDataSource';
import { CachedPokemon } from '../../../domain/model/CachedPokemon';

describe('MemoryLocalDataSource', () => {
  let dataSource: MemoryLocalDataSource;

  beforeEach(() => {
    dataSource = new MemoryLocalDataSource();
  });

  const mockPokemon: CachedPokemon = {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    weight: 69,
    base_experience: 112,
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    },
    types: [
      { type: { name: 'grass' } },
      { type: { name: 'poison' } },
    ],
    abilities: [
      { ability: { name: 'overgrow' }, is_hidden: false, slot: 1 },
      { ability: { name: 'chlorophyll' }, is_hidden: true, slot: 2 },
    ],
    stats: [
      { base_stat: 45, stat: { name: 'hp' } },
    ],
    cachedAt: Date.now(),
  };

  it('should return null when getting a pokemon that does not exist', async () => {
    const result = await dataSource.getPokemon('absent');
    expect(result).toBeNull();
  });

  it('should save and then get a pokemon', async () => {
    await dataSource.savePokemon(mockPokemon);
    const result = await dataSource.getPokemon('bulbasaur');
    
    expect(result).not.toBeNull();
    expect(result?.name).toBe(mockPokemon.name);
    expect(result?.id).toBe(mockPokemon.id);
    expect(result?.cachedAt).toBeGreaterThanOrEqual(mockPokemon.cachedAt);
  });

  it('should return true when pokemon exists', async () => {
    await dataSource.savePokemon(mockPokemon);
    const exists = await dataSource.exists('bulbasaur');
    expect(exists).toBe(true);
  });

  it('should return false when pokemon does not exist', async () => {
    const exists = await dataSource.exists('absent');
    expect(exists).toBe(false);
  });

  it('should delete a pokemon', async () => {
    await dataSource.savePokemon(mockPokemon);
    await dataSource.deletePokemon('bulbasaur');
    const result = await dataSource.getPokemon('bulbasaur');
    expect(result).toBeNull();
  });

  it('should get all pokemons', async () => {
    const pokemon2 = { ...mockPokemon, name: 'ivysaur', id: 2 };
    await dataSource.savePokemon(mockPokemon);
    await dataSource.savePokemon(pokemon2);

    const all = await dataSource.getAllPokemon();
    expect(all).toHaveLength(2);
    expect(all.map(p => p.name)).toContain('bulbasaur');
    expect(all.map(p => p.name)).toContain('ivysaur');
  });

  it('should clear all pokemons', async () => {
    await dataSource.savePokemon(mockPokemon);
    await dataSource.clearAll();
    const all = await dataSource.getAllPokemon();
    expect(all).toHaveLength(0);
  });

  it('should handle storage key normalization (lowercase)', async () => {
    await dataSource.savePokemon(mockPokemon);
    const result = await dataSource.getPokemon('BULBASAUR');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('bulbasaur');
  });
});
