import { useEffect, useState, useCallback, useRef } from 'react';
import { PokemonDetail } from '../domain/model/PokemonDetail';
import { dependencyContainer } from '../services/DependencyContainer';

interface UsePokemonInfiniteListState {
  data: PokemonDetail[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
}

const ITEMS_PER_PAGE = 20;

export function usePokemonInfiniteList(): UsePokemonInfiniteListState {
  const [data, setData] = useState<PokemonDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialPokemon = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const pokemonRepository = dependencyContainer.getPokemonRepository();
        const pokemonList = await pokemonRepository.getPokemonListWithDetails(ITEMS_PER_PAGE, 0);

        if (isMounted) {
          setData(pokemonList);
          setIsLoading(false);
          setHasMore(pokemonList.length >= ITEMS_PER_PAGE);
          offsetRef.current = ITEMS_PER_PAGE;
        }
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
          setError(err instanceof Error ? err.message : 'An error occurred');
          setHasMore(false);
        }
      }
    };

    fetchInitialPokemon();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || isLoadingMore) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const pokemonRepository = dependencyContainer.getPokemonRepository();
      const newPokemon = await pokemonRepository.getPokemonListWithDetails(
        ITEMS_PER_PAGE,
        offsetRef.current
      );

      setData((prev) => [...prev, ...newPokemon]);
      setError(null);
      setHasMore(newPokemon.length >= ITEMS_PER_PAGE);
      offsetRef.current += ITEMS_PER_PAGE;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading more');
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [isLoadingMore]);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
  };
}
