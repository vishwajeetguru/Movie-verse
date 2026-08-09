"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPopularMovies, searchMovies } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types";

interface UseInfiniteMoviesResult {
  movies: TMDBMovie[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  /** Attach to a sentinel element to trigger loading the next page. */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Infinite-scroll movie feed.
 * - No query  -> TMDB popular movies
 * - With query -> TMDB search results
 */
export function useInfiniteMovies(query = ""): UseInfiniteMoviesResult {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset when the query changes.
  useEffect(() => {
    abortRef.current?.abort();
    setMovies([]);
    setPage(1);
    setTotalPages(1);
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const fetcher = query.trim()
      ? searchMovies(query.trim(), 1, { signal: controller.signal })
      : getPopularMovies(1, { signal: controller.signal });

    fetcher
      .then((data) => {
        if (controller.signal.aborted) return;
        setMovies(data.results);
        setTotalPages(Math.min(data.total_pages, 50)); // TMDB caps at 500 pages; keep it sane
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") {
          setError("Failed to load movies. Check your TMDB API key.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    const fetcher = query.trim()
      ? searchMovies(query.trim(), nextPage)
      : getPopularMovies(nextPage);

    fetcher
      .then((data) => {
        setMovies((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...data.results.filter((m) => !seen.has(m.id))];
        });
        setPage(nextPage);
      })
      .catch(() => {
        /* keep what we have */
      })
      .finally(() => setIsLoadingMore(false));
  }, [isLoading, isLoadingMore, page, totalPages, query]);

  // IntersectionObserver on the sentinel element.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return {
    movies,
    isLoading,
    isLoadingMore,
    hasMore: page < totalPages,
    error,
    sentinelRef,
  };
}
