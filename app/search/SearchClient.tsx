"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Layers, Loader2, SearchX } from "lucide-react";
import { MovieGrid, MovieGridSkeleton } from "@/components/MovieGrid";
import { SearchBar } from "@/components/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteMovies } from "@/hooks/useInfiniteMovies";
import { searchCollections } from "@/lib/collections";
import type { CollectionMeta } from "@/types";

export function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  // Keep local state in sync when arriving with ?q=...
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const { movies, isLoading, isLoadingMore, hasMore, error, sentinelRef } =
    useInfiniteMovies(debouncedQuery);

  const [matchedCollections, setMatchedCollections] = useState<CollectionMeta[]>([]);
  useEffect(() => {
    setMatchedCollections(searchCollections(debouncedQuery));
  }, [debouncedQuery]);

  return (
    <div className="container space-y-10 py-10">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Search the <span className="text-primary">Verse</span>
        </h1>
        <SearchBar placeholder="Try 'Inception', 'thriller', or a collection title..." />
      </div>

      {/* Matched collections */}
      {matchedCollections.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Layers className="h-5 w-5 text-primary" />
            Matching Collections
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {matchedCollections.map((c) => (
              <Link
                key={c.slug}
                href={`/collection/${c.slug}`}
                className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:border-primary/40"
              >
                <p className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                  {c.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.totalMovies} movies
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Movies */}
      <section className="space-y-5">
        <h2 className="text-lg font-bold">
          {debouncedQuery.trim()
            ? `Results for "${debouncedQuery.trim()}"`
            : "Popular Right Now"}
        </h2>

        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            {error}
          </p>
        )}

        {isLoading ? (
          <MovieGridSkeleton />
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-14 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nothing found for &ldquo;{debouncedQuery}&rdquo;. Try another title.
            </p>
          </div>
        ) : (
          <>
            <MovieGrid movies={movies} />
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-8">
              {isLoadingMore && (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              )}
              {!hasMore && movies.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  You&apos;ve reached the end of the list.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
