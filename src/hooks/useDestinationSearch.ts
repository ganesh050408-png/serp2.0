import { useEffect, useRef, useState } from 'react';
import {
  DESTINATION_SEARCH_DEBOUNCE_MS,
  getCachedDestinationResults,
  searchCities,
  searchDestinations,
  type DestinationInfo,
} from '../services/destinations';

interface DestinationSearchState {
  results: DestinationInfo[];
  isLoading: boolean;
}

export const useDestinationSearch = (query: string): DestinationSearchState => {
  const [state, setState] = useState<DestinationSearchState>(() => ({
    results: searchCities(query),
    isLoading: false,
  }));
  const requestSequence = useRef(0);

  useEffect(() => {
    const cleanQuery = query.trim();
    const localResults = searchCities(cleanQuery);
    const sequence = ++requestSequence.current;

    setState({ results: localResults, isLoading: false });

    if (cleanQuery.length < 3) return;

    const cachedResults = getCachedDestinationResults(cleanQuery);
    if (cachedResults) {
      setState({ results: cachedResults, isLoading: false });
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setState((previous) => ({ ...previous, isLoading: true }));

      try {
        const results = await searchDestinations(cleanQuery, controller.signal);
        if (sequence === requestSequence.current) {
          setState({ results, isLoading: false });
        }
      } catch {
        if (sequence === requestSequence.current) {
          setState({ results: localResults, isLoading: false });
        }
      }
    }, DESTINATION_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return state;
};
