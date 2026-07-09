import { useEffect, useState } from 'react';
import { PokemonDetail } from '../domain/model/PokemonDetail';
import { dependencyContainer } from '../services/DependencyContainer';

interface UsePokemonDetailState {
  data: PokemonDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function usePokemonDetail(nameOrId: string | number): UsePokemonDetailState {
  const [state, setState] = useState<UsePokemonDetailState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchPokemonDetail = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const pokemonRepository = dependencyContainer.getPokemonRepository();
        const pokemonDetail = await pokemonRepository.getPokemonDetail(nameOrId);

        if (isMounted) {
          setState({
            data: pokemonDetail,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          });
        }
      }
    };

    fetchPokemonDetail();

    return () => {
      isMounted = false;
    };
  }, [nameOrId]);

  return state;
}
