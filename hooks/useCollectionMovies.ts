"use client";

import { useEffect, useRef, useState } from "react";
import { resolveMovieNames } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types";

interface UseCollectionMoviesResult {
  movies: TMDBMovie[];
  /** Names that failed to resolve on TMDB. */
  failed: string[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Resolve a collection's movie names into full TMDB movie objects.
 * Keeps the original ordering defined in the JSON file.
 */
export function useCollectionMovies(names: string[]): UseCollectionMoviesResult {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<string>("");

  const namesKey = names.join("|");

  useEffect(() => {
    if (names.length === 0) {
      setMovies([]);
      setIsLoading(false);
      return;
    }
    if (keyRef.current === namesKey) return;
    keyRef.current = namesKey;

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const { searchMovie } = await import("@/lib/tmdb");
        const results = await Promise.allSettled(
          names.map((name) => searchMovie(name, { signal: controller.signal }))
        );

        if (controller.signal.aborted) return;

        const resolved: TMDBMovie[] = [];
        const missed: string[] = [];

        results.forEach((result, i) => {
          if (result.status === "fulfilled" && result.value) {
            resolved.push(result.value);
          } else {
            missed.push(names[i]);
          }
        });

        setMovies(resolved);
        setFailed(missed);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Failed to load collection movies. Check your TMDB API key.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namesKey]);

  return { movies, failed, isLoading, error };
}

/** Lightweight hook: resolve just the first N posters of a collection (for previews). */
export function useCollectionPreviews(names: string[], count = 4) {
  const [posters, setPosters] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const namesKey = names.slice(0, count).join("|");

  useEffect(() => {
    const slice = names.slice(0, count);
    if (slice.length === 0) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);

    resolveMovieNames(slice, { signal: controller.signal })
      .then((resolved) => {
        if (!controller.signal.aborted) {
          setPosters(resolved.map((m) => m.poster_path));
        }
      })
      .catch(() => {
        /* previews are best-effort */
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namesKey, count]);

  return { posters, isLoading };
}
