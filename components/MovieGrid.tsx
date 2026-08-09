"use client";

import { cn } from "@/lib/utils";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import type { TMDBMovie } from "@/types";

interface MovieGridProps {
  movies: TMDBMovie[];
  /** Show rank badges (collection pages). */
  ranked?: boolean;
  genreMap?: Map<number, string>;
  fromCollection?: string;
  className?: string;
  priorityCount?: number;
}

export function MovieGrid({
  movies,
  ranked = false,
  genreMap,
  fromCollection,
  className,
  priorityCount = 6,
}: MovieGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className
      )}
    >
      {movies.map((movie, i) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          rank={ranked ? i + 1 : undefined}
          genreMap={genreMap}
          fromCollection={fromCollection}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
