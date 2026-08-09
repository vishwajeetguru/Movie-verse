"use client";

import { useEffect, useState } from "react";
import { getSimilarMovies } from "@/lib/tmdb";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import type { TMDBMovie } from "@/types";

interface RelatedMoviesProps {
  tmdbId: number;
}

/** "You may also like" rail using TMDB similar movies. */
export function RelatedMovies({ tmdbId }: RelatedMoviesProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setMovies([]);
    getSimilarMovies(tmdbId, { signal: controller.signal })
      .then((results) => {
        if (!controller.signal.aborted) setMovies(results);
      })
      .catch(() => {
        /* related is best-effort */
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [tmdbId]);

  if (!isLoading && movies.length === 0) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold sm:text-2xl">You May Also Like</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-36 shrink-0 snap-start sm:w-44">
                <MovieCardSkeleton />
              </div>
            ))
          : movies.map((movie, i) => (
              <div key={movie.id} className="w-36 shrink-0 snap-start sm:w-44">
                <MovieCard movie={movie} priority={i < 4} />
              </div>
            ))}
      </div>
    </section>
  );
}
