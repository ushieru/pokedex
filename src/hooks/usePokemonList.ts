import { useEffect, useState } from 'react';
import { PokemonDetail } from '../domain/model/PokemonDetail';
import { dependencyContainer } from '../services/DependencyContainer';

interface UsePokemonListState {
  data: PokemonDetail[]
  isLoading: boolean
  error: string | null
}

export function usePokemonList(limit: number = 20, offset: number = 0): UsePokemonListState {
  const [state, setState] = useState<UsePokemonListState>({
    data: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchPokemon = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))
        const pokemonRepository = dependencyContainer.getPokemonRepository()
        const pokemonList = await pokemonRepository.getPokemonListWithDetails(limit, offset)
        
        if (isMounted) {
          setState({
            data: pokemonList,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: [],
            isLoading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          });
        }
      }
    }

    fetchPokemon();

    return () => {
      isMounted = false;
    }
  }, [limit, offset])

  return state;
}
