import { DaysCacheStrategy } from '../data/cache/DaysCacheStrategy';
import { ICacheStrategy } from '../data/cache/ICacheStrategy';
import { memoryLocalDataSourceSingleton } from '../data/local/MemoryLocalDataSource';
import { ILocalDataSource } from '../data/local/ILocalDataSource';
import { PokemonRepository } from '../domain/model/PokemonRepository';
import { pokemonPokeApiRepositorySingleton } from './PokemonPokeApiRepository';
import { PokemonRepositoryWithCache } from './PokemonRepositoryWithCache';

class DependencyContainer {
  static instance: DependencyContainer | null = null;
  baseRepository: PokemonRepository;
  localDataSource: ILocalDataSource;
  cacheStrategy: ICacheStrategy;
  cachedRepository: PokemonRepository;

  constructor() {
    this.baseRepository = pokemonPokeApiRepositorySingleton;
    this.localDataSource = memoryLocalDataSourceSingleton;
    this.cacheStrategy = new DaysCacheStrategy();
    this.cachedRepository = new PokemonRepositoryWithCache(
      this.baseRepository,
      this.localDataSource,
      this.cacheStrategy
    );
  }

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  getPokemonRepository(): PokemonRepository {
    return this.cachedRepository;
  }

  setCacheStrategy(strategy: ICacheStrategy): void {
    this.cacheStrategy = strategy;
    this.cachedRepository = new PokemonRepositoryWithCache(
      this.baseRepository,
      this.localDataSource,
      this.cacheStrategy
    );
  }

  setLocalDataSource(dataSource: ILocalDataSource): void {
    this.localDataSource = dataSource;
    this.cachedRepository = new PokemonRepositoryWithCache(
      this.baseRepository,
      this.localDataSource,
      this.cacheStrategy
    );
  }

  getLocalDataSource(): ILocalDataSource {
    return this.localDataSource;
  }

  static reset(): void {
    DependencyContainer.instance = new DependencyContainer();
  }
}

export const dependencyContainer = DependencyContainer.getInstance();

