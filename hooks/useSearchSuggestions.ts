"use client";

import { useEffect, useRef, useState } from "react";
import { searchMulti } from "@/lib/tmdb";
import { searchCollections } from "@/lib/collections";
import { getYear } from "@/lib/utils";
import type { SearchSuggestion } from "@/types";
import { useDebounce } from "./useDebounce";

interface UseSearchSuggestionsResult {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
}

/**
 * Global instant-search hook.
 * Queries TMDB multi-search AND local collection JSON files,
 * merging them into a single suggestion list.
 */
export function useSearchSuggestions(query: string): UseSearchSuggestionsResult {
  const debouncedQuery = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    (async () => {
      try {
        const results = await searchMulti(q, { signal: controller.signal });

        const mediaSuggestions: SearchSuggestion[] = results
          .slice(0, 6)
          .map((r) => ({
            id: r.id,
            type: r.media_type === "tv" ? "tv" : "movie",
            title: r.title ?? r.name ?? "Unknown",
            subtitle: r.overview?.slice(0, 80),
            posterPath: r.poster_path,
            year: getYear(r.release_date ?? r.first_air_date),
            rating: r.vote_average,
          }));

        // Collection title matches go on top (they're the product focus).
        const collectionSuggestions: SearchSuggestion[] = searchCollections(q)
          .slice(0, 3)
          .map((c) => ({
            id: 0,
            type: "collection",
            title: c.title,
            subtitle: `${c.totalMovies} movies`,
            slug: c.slug,
          }));

        if (!controller.signal.aborted) {
          setSuggestions([...collectionSuggestions, ...mediaSuggestions]);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery]);

  return { suggestions, isLoading };
}
