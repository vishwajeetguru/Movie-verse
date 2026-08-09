"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTrendingMovies } from "@/lib/tmdb";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import type { TMDBMovie } from "@/types";

/** Horizontally scrollable trending movies rail. */
export function TrendingRow() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    getTrendingMovies({ signal: controller.signal })
      .then((results) => {
        if (!controller.signal.aborted) setMovies(results.slice(0, 15));
      })
      .catch(() => {
        /* trending is best-effort */
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  function scrollBy(dir: 1 | -1) {
    railRef.current?.scrollBy({ left: dir * 640, behavior: "smooth" });
  }

  return (
    <section className="container space-y-5 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            This week
          </p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Trending Now</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground backdrop-blur-md transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground backdrop-blur-md transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-36 shrink-0 snap-start sm:w-44">
                <MovieCardSkeleton />
              </div>
            ))
          : movies.map((movie, i) => (
              <div key={movie.id} className="w-36 shrink-0 snap-start sm:w-44">
                <MovieCard movie={movie} priority={i < 5} />
              </div>
            ))}
      </div>
    </section>
  );
}
